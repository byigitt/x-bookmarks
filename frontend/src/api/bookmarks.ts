export interface Bookmark {
  id: number;
  tweetId: string;
  title: string | null;
  source: string | null;
  readAt: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");

const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",
);

const BOOKMARKS_ENDPOINT = `${API_BASE_URL}/bookmarks`;

export const fetchBookmarks = async (): Promise<Bookmark[]> => {
  const response = await fetch(BOOKMARKS_ENDPOINT, {
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Unable to fetch bookmarks");
  }

  return response.json();
};

export const setBookmarkReadState = async (
  tweetId: string,
  read: boolean,
): Promise<Bookmark> => {
  const response = await fetch(`${BOOKMARKS_ENDPOINT}/${encodeURIComponent(tweetId)}/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read }),
  });

  if (!response.ok) {
    throw new Error("Unable to update bookmark state");
  }

  return response.json();
};
