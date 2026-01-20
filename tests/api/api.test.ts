import { jest } from "@jest/globals";

// 1. Define Mocks
const mockStorage: Record<string, any> = {};
const mockProviders: Record<string, any> = {};

// 2. Setup Global Mocks (must be before imports that use them)
(global as any).defineEventHandler = (fn: any) => fn;
(global as any).readBody = jest.fn<() => Promise<any>>();
(global as any).createError = (err: any) => err;
(global as any).useStorage = () => ({
  getItem: jest.fn((key: string) => mockStorage[key]),
  setItem: jest.fn((key: string, val: any) => {
    mockStorage[key] = val;
  }),
});

// Mock the providers module
jest.unstable_mockModule("../../server/utils/providers/index", () => ({
  providers: mockProviders,
}));

// 3. Import Handlers (must be after mockModule)
const dataFetchHandler = (await import("../../server/api/data-fetch.post"))
  .default;

describe("API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key in mockStorage) delete mockStorage[key];
    for (const key in mockProviders) delete mockProviders[key];
  });

  describe("POST /api/data-fetch", () => {
    it("should return error if countries or sourceKey is missing", async () => {
      (
        (global as any).readBody as jest.Mock<() => Promise<any>>
      ).mockResolvedValueOnce({});

      await expect(dataFetchHandler({} as any)).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Missing countries or sourceKey",
      });
    });

    it("should fetch data from provider", async () => {
      const mockResults = [{ countryCode: "US", rawValue: 100 }];
      mockProviders["worldbank"] = {
        fetch: jest.fn<() => Promise<any>>().mockResolvedValueOnce(mockResults),
      };

      (
        (global as any).readBody as jest.Mock<() => Promise<any>>
      ).mockResolvedValueOnce({
        countries: ["US"],
        sourceKey: "worldbank:gdp",
      });

      const result: any = await dataFetchHandler({} as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResults);
      expect(mockProviders["worldbank"].fetch).toHaveBeenCalledWith(
        ["US"],
        "gdp",
      );
    });

    it("should fallback to null results if provider fails", async () => {
      mockProviders["worldbank"] = {
        fetch: jest
          .fn<() => Promise<any>>()
          .mockRejectedValueOnce(new Error("API Down")),
      };

      (
        (global as any).readBody as jest.Mock<() => Promise<any>>
      ).mockResolvedValueOnce({
        countries: ["US"],
        sourceKey: "worldbank:gdp",
      });

      const result: any = await dataFetchHandler({} as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ countryCode: "US", rawValue: null }]);
    });
  });
});
