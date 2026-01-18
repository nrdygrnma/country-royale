export const UNSPLASH_CLIENT_ID = "ns1IDRUHINSoeyDxTbjDwMTvdyBfLVqWR1YqA31Wi68";

export interface UnsplashImage {
  url: string;
  attribution: string;
}

export async function fetchCountryImage(
  countryName: string,
): Promise<UnsplashImage | null> {
  const query = encodeURIComponent(countryName);
  const url = `https://api.unsplash.com/search/photos?client_id=${UNSPLASH_CLIENT_ID}&query=${query}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Unsplash API error:", response.statusText);
      return null;
    }
    const data = await response.json();

    const photos = Array.isArray(data) ? data : data.results;

    if (Array.isArray(photos) && photos.length > 0) {
      // Pick a random photo from the results to ensure variety
      const randomIndex = Math.floor(
        Math.random() * Math.min(photos.length, 5),
      );
      const photo = photos[randomIndex];
      const imageUrl = photo.urls?.small || photo.urls?.regular;
      const attribution =
        photo.sponsorship?.sponsor?.name || photo.user?.name || "Unsplash";

      if (imageUrl) {
        // Append size parameters to the URL to ensure it's not too large
        const optimizedUrl = imageUrl.includes("?")
          ? `${imageUrl}&w=800&q=80&auto=format`
          : `${imageUrl}?w=800&q=80&auto=format`;
        return {
          url: optimizedUrl,
          attribution,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to fetch image from Unsplash:", error);
    return null;
  }
}
