import { useEffect, useState } from "react";
import BookmarkList from "./components/BookmarkList";
import type { Bookmark } from "./api/bookmarks";
import { fetchBookmarks, setBookmarkReadState } from "./api/bookmarks";

const App = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadBookmarks = async () => {
      try {
        const data = await fetchBookmarks();
        if (active) {
          setBookmarks(data);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load bookmarks",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBookmarks();

    return () => {
      active = false;
    };
  }, []);

  const handleToggleRead = async (
    bookmark: Bookmark,
    nextReadState: boolean,
  ) => {
    const previous = bookmark;

    setError(null);
    setBookmarks((current) =>
      current.map((item) =>
        item.id === bookmark.id
          ? {
              ...item,
              isRead: nextReadState,
              readAt: nextReadState ? new Date().toISOString() : null,
            }
          : item,
      ),
    );

    try {
      const updated = await setBookmarkReadState(bookmark.tweetId, nextReadState);
      setBookmarks((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (toggleError) {
      setBookmarks((current) =>
        current.map((item) => (item.id === previous.id ? previous : item)),
      );
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Unable to update bookmark state",
      );
    }
  };

  const handleOpen = (bookmark: Bookmark) => {
    const targetUrl = bookmark.source
      ? bookmark.source
      : `https://x.com/i/web/status/${bookmark.tweetId}`;

    window.open(targetUrl, "_blank", "noopener");

    if (!bookmark.isRead) {
      void handleToggleRead(bookmark, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Saved Bookmarks
          </h1>
          <p className="text-sm text-slate-600">
            Review unread links, mark them as read once you are done.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
            Loading bookmarks...
          </div>
        ) : (
          <BookmarkList
            bookmarks={bookmarks}
            onOpen={handleOpen}
            onToggleRead={handleToggleRead}
          />
        )}
      </div>
    </div>
  );
};

export default App;
