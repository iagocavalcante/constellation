# Constellation

This project was developed on top of ATProto, using the PDS of the BlueSky project.

The main go its to create a instagram like app, but using the BlueSky project as a backend. Maybe we can
think in start our own PDS just to serve this app.

### TODO List

- [x] Create new account
- [ ] Forgot password
- [ ] Choose interests
- [x] Login with your BlueSky account
- [x] Create a new post
  - [ ] using camera to take a picture
  - [ ] using RichText from atproto to deal with the post content
- [x] Like/Unlike a post
- [ ] Comment a post
- [ ] Follow a user
- [x] See feed
- [ ] See profile
  - [ ] Change profile picture
  - [ ] Change profile description
  - [ ] Change profile interests
- [ ] Thinking in a way to deal with multiple feeds
- [ ] Stories implementation

  ```mermaid
  graph TD
    subgraph Mobile App
      A[User Interface] -->|Fetch Stories| B[Bluesky API]
      A -->|Upload Video| C[Bluesky API]
      A -->|Check Upload Limits| D[Bluesky API]
      A -->|Poll Job Status| E[Bluesky API]
      A -->|Store Viewed Stories| F[Local Storage]
    end

    subgraph Bluesky API
      B[Fetch Stories]
      C[Upload Video]
      D[Get Upload Limits]
      E[Check Job Status]
    end

    subgraph Storage
      F[Local Storage] -->|Cache Stories| A
    end
  ```

https://github.com/user-attachments/assets/f713bae4-7301-4ef4-9dc2-c7373af727d9
