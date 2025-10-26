import type { MouseEvent } from "react";
import type { Bookmark } from "../api/bookmarks";

interface BookmarkCardProps {
  bookmark: Bookmark;
  onOpen: (bookmark: Bookmark) => void;
  onToggleRead: (bookmark: Bookmark, nextReadState: boolean) => void;
}

const BookmarkCard = ({ bookmark, onOpen, onToggleRead }: BookmarkCardProps) => {
  const isRead = bookmark.isRead;
  const displayTitle = bookmark.title ?? bookmark.text ?? `Tweet ${bookmark.tweetId}`;
  const displayText = bookmark.text ?? bookmark.title;
  const primaryImage = bookmark.thumbnailUrl ?? bookmark.mediaUrls[0] ?? null;

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
      <header className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {bookmark.authorAvatarUrl && (
            <img
              src={bookmark.authorAvatarUrl}
              alt={bookmark.authorName ? `${bookmark.authorName}'s avatar` : "Author avatar"}
              className="h-12 w-12 rounded-full object-cover shadow-sm"
            />
          )}
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900">{displayTitle}</h2>
            {bookmark.authorName && (
              <span className="text-sm text-slate-600">{bookmark.authorName}</span>
            )}
            {bookmark.authorUsername && (
              <span className="text-xs text-slate-500">@{bookmark.authorUsername}</span>
            )}
          </div>
        </div>
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

      {displayText && (
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{displayText}</p>
      )}

      {primaryImage && (
        <img
          src={primaryImage}
          alt="Tweet media preview"
          className="w-full rounded-lg border border-slate-200 object-cover"
        />
      )}

      {bookmark.metrics && (
        <ul className="flex flex-wrap gap-4 text-xs text-slate-500">
          {Object.entries(bookmark.metrics).map(([key, value]) => (
            <li key={key} className="flex items-center gap-1">
              <span className="font-semibold text-slate-700">
                {new Intl.NumberFormat().format(value)}
              </span>
              <span>
                {key === "replies"
                  ? "Replies"
                  : key === "retweets"
                    ? "Retweets"
                    : key === "likes"
                      ? "Likes"
                      : key === "views"
                        ? "Views"
                        : key}
              </span>
            </li>
          ))}
        </ul>
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
