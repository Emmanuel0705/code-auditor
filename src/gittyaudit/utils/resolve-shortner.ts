import axios from "axios";
export async function resolveShortenedUrl(shortUrl): Promise<string | null> {
  try {
    const response = await axios.head(shortUrl, {
      maxRedirects: 5, // Follow up to 5 redirects
    });

    // Extract the final URL after redirects
    const finalUrl = response.request.res.responseUrl;

    // Validate if it's a GitHub URL
    if (finalUrl.includes("github.com")) {
      return finalUrl;
    } else {
      throw new Error("The URL is not a GitHub repository.");
    }
  } catch (error) {
    console.error("Error resolving URL:", error.message);
    return null;
  }
}
