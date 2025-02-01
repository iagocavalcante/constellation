import { Home } from "./home";
import { Add } from "./add";
import { Profile } from "./profile";
import { Send } from "./send";
import { Bookmark } from "./bookmark";
import { Comment } from "./comment";
import { Message } from "./message";
import { Heart } from "./heart";
import { Search } from "./search";

export const icons = {
  home: Home,
  add: Add,
  heart: Heart,
  profile: Profile,
  send: Send,
  bookmark: Bookmark,
  search: Search,
  comment: Comment,
  message: Message,
};

export type IconName = keyof typeof icons;
