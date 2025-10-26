import BookmarkCard from "./BookmarkCard";
import type { Bookmark } from "../api/bookmarks";

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onOpen: (bookmark: Bookmark) => void;
  onToggleRead: (bookmark: Bookmark, nextReadState: boolean) => void;
}

const BookmarkList = ({ bookmarks, onOpen, onToggleRead }: BookmarkListProps) => {
  if (!bookmarks.length) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
        No bookmarks yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <BookmarkCard
          key={bookmark.id}
          bookmark={bookmark}
          onOpen={onOpen}
          onToggleRead={onToggleRead}
        />
      ))}
    </div>
  );
};

export default BookmarkList;
