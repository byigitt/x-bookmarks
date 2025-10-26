import type { MouseEvent } from "react";
import type { Bookmark } from "../api/bookmarks";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onOpen: (bookmark: Bookmark) => void;
  onToggleRead: (bookmark: Bookmark, nextReadState: boolean) => void;
}

const BookmarkCard = ({ bookmark, onOpen, onToggleRead }: BookmarkCardProps) => {
  const isRead = bookmark.isRead;

  const cardClasses = [
    "flex",
    "flex-col",
    "gap-3",
    "rounded-xl",
    "border",
    "p-5",
    "transition",
    "duration-200",
    "cursor-pointer",
    isRead ? "border-slate-300 bg-white/70 hover:border-slate-400" : "border-blue-400 bg-blue-50 hover:border-blue-500",
    isRead ? "shadow-sm" : "shadow-lg shadow-blue-200",
  ].join(" ");

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleRead(bookmark, !bookmark.isRead);
  };

  return (
    <article className={cardClasses} onClick={() => onOpen(bookmark)}>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {bookmark.title ?? `Tweet ${bookmark.tweetId}`}
        </h2>
        <span
          className={[
            "rounded-full",
            "px-3",
            "py-1",
            "text-xs",
            "font-medium",
            isRead ? "bg-slate-200 text-slate-600" : "bg-blue-500 text-white",
          ].join(" ")}
        >
          {isRead ? "Read" : "New"}
        </span>
      </header>

      {bookmark.source && (
        <p className="text-sm text-slate-600 truncate">{bookmark.source}</p>
      )}

      <footer className="flex items-center justify-between text-sm text-slate-500">
        <time dateTime={bookmark.createdAt}>
          Added {new Date(bookmark.createdAt).toLocaleString()}
        </time>
        <button
          type="button"
          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-100"
          onClick={handleToggle}
        >
          {isRead ? "Mark unread" : "Mark read"}
        </button>
      </footer>
    </article>
  );
};

export default BookmarkCard;
