import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Principal "mo:core/Principal";
import OutCall "http-outcalls/outcall";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types and Modules
  public type Genre = {
    id : Nat;
    name : Text;
  };

  public type Comic = {
    id : Nat;
    title : Text;
    description : Text;
    coverImage : Text;
    type_ : Text; // Manga, Manhwa, Manhua
    genres : [Nat]; // Genre IDs
    status : Text; // Ongoing, Completed
    author : Text;
    artist : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    viewCount : Nat;
  };

  public type Chapter = {
    id : Nat;
    comicId : Nat;
    number : Nat;
    title : Text;
    pages : [Text]; // Image URLs
    createdAt : Time.Time;
  };

  public type Comment = {
    id : Nat;
    chapterId : Nat;
    userId : Blob;
    username : Text;
    text : Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    username : Text;
    avatarUrl : Text;
  };

  // Field extraction and comparison for sorting
  module Comic {
    public func compareByUpdatedAt(c1 : Comic, c2 : Comic) : Order.Order {
      Int.compare(c2.updatedAt, c1.updatedAt);
    };
  };

  // Storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let genres = Map.empty<Nat, Genre>();
  let comics = Map.empty<Nat, Comic>();
  let chapters = Map.empty<Nat, Chapter>();
  let comments = Map.empty<Nat, Comment>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextGenreId = 1;
  var nextComicId = 1;
  var nextChapterId = 1;
  var nextCommentId = 1;

  // Middleware helpers
  func requireAdmin(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Admin role is required");
    };
  };

  func requireUser(caller : Principal) {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Authenticated user role is required");
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Genre CRUD
  public shared ({ caller }) func createGenre(name : Text) : async Genre {
    requireAdmin(caller);
    let genre : Genre = { id = nextGenreId; name };
    genres.add(nextGenreId, genre);
    nextGenreId += 1;
    genre;
  };

  public shared ({ caller }) func deleteGenre(id : Nat) : async () {
    requireAdmin(caller);
    if (not genres.containsKey(id)) {
      Runtime.trap("Genre not found");
    };
    genres.remove(id);
  };

  // Comic CRUD
  public shared ({ caller }) func createComic(title : Text, description : Text, coverImage : Text, type_ : Text, genreIds : [Nat], status : Text, author : Text, artist : Text) : async Comic {
    requireAdmin(caller);
    let comic : Comic = {
      id = nextComicId;
      title;
      description;
      coverImage;
      type_;
      genres = genreIds;
      status;
      author;
      artist;
      createdAt = Time.now();
      updatedAt = Time.now();
      viewCount = 0;
    };
    comics.add(nextComicId, comic);
    nextComicId += 1;
    comic;
  };

  public shared ({ caller }) func updateComic(id : Nat, title : Text, description : Text, coverImage : Text, type_ : Text, genreIds : [Nat], status : Text, author : Text, artist : Text) : async Comic {
    requireAdmin(caller);
    switch (comics.get(id)) {
      case (null) { Runtime.trap("Comic not found") };
      case (?existing) {
        let updated : Comic = {
          id;
          title;
          description;
          coverImage;
          type_;
          genres = genreIds;
          status;
          author;
          artist;
          createdAt = existing.createdAt;
          updatedAt = Time.now();
          viewCount = existing.viewCount;
        };
        comics.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteComic(id : Nat) : async () {
    requireAdmin(caller);
    if (not comics.containsKey(id)) {
      Runtime.trap("Comic not found");
    };
    comics.remove(id);
  };

  // Chapter CRUD
  public shared ({ caller }) func createChapter(comicId : Nat, number : Nat, title : Text, pages : [Text]) : async Chapter {
    requireAdmin(caller);
    let chapter : Chapter = {
      id = nextChapterId;
      comicId;
      number;
      title;
      pages;
      createdAt = Time.now();
    };
    chapters.add(nextChapterId, chapter);
    nextChapterId += 1;
    chapter;
  };

  public shared ({ caller }) func updateChapter(id : Nat, number : Nat, title : Text, pages : [Text]) : async Chapter {
    requireAdmin(caller);
    switch (chapters.get(id)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?existing) {
        let updated : Chapter = {
          id;
          comicId = existing.comicId;
          number;
          title;
          pages;
          createdAt = existing.createdAt;
        };
        chapters.add(id, updated);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteChapter(id : Nat) : async () {
    requireAdmin(caller);
    if (not chapters.containsKey(id)) {
      Runtime.trap("Chapter not found");
    };
    chapters.remove(id);
  };

  // Queries - public read access (no auth required)
  public query func getComics(genre : ?Nat, type_ : ?Text, status : ?Text, search : ?Text) : async [Comic] {
    comics.values().toArray().filter(
      func(c) {
        let matchesGenre = switch (genre) {
          case (null) { true };
          case (?g) {
            c.genres.find(func(genreId) { genreId == g }) != null;
          };
        };
        let matchesType = switch (type_) {
          case (null) { true };
          case (?t) { c.type_ == t };
        };
        let matchesStatus = switch (status) {
          case (null) { true };
          case (?s) { c.status == s };
        };
        let matchesSearch = switch (search) {
          case (null) { true };
          case (?s) {
            c.title.contains(#text(s.toLower())) or c.description.contains(#text(s.toLower()));
          };
        };
        matchesGenre and matchesType and matchesStatus and matchesSearch
      }
    );
  };

  public query func getComicById(id : Nat) : async Comic {
    switch (comics.get(id)) {
      case (null) { Runtime.trap("Comic not found") };
      case (?comic) { comic };
    };
  };

  public query func getChaptersByComicId(comicId : Nat) : async [Chapter] {
    chapters.values().toArray().filter(func(c) { c.comicId == comicId });
  };

  public query func getChapterById(id : Nat) : async Chapter {
    switch (chapters.get(id)) {
      case (null) { Runtime.trap("Chapter not found") };
      case (?chapter) { chapter };
    };
  };

  public query func getLatestUpdatedComics(limit : Nat) : async [Comic] {
    let sorted = comics.values().toArray().sort(Comic.compareByUpdatedAt);
    sorted.sliceToArray(0, limit);
  };

  // Comments
  // addComment requires an authenticated user (not anonymous/guest)
  public shared ({ caller }) func addComment(chapterId : Nat, text : Text, username : Text) : async Comment {
    requireUser(caller);
    let comment : Comment = {
      id = nextCommentId;
      chapterId;
      userId = caller.toBlob();
      username;
      text;
      createdAt = Time.now();
    };
    comments.add(nextCommentId, comment);
    nextCommentId += 1;
    comment;
  };

  // deleteComment: admin can delete any comment; comment owner can delete their own
  public shared ({ caller }) func deleteComment(commentId : Nat) : async () {
    requireUser(caller);
    switch (comments.get(commentId)) {
      case (null) { Runtime.trap("Comment not found") };
      case (?comment) {
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);
        let isOwner = comment.userId == caller.toBlob();
        if (not isAdmin and not isOwner) {
          Runtime.trap("Unauthorized: Only admins or the comment owner can delete this comment");
        };
        comments.remove(commentId);
      };
    };
  };

  // Utility Queries - public read access
  public query func getCommentsByChapterId(chapterId : Nat) : async [Comment] {
    comments.values().toArray().filter(func(c) { c.chapterId == chapterId });
  };

  public query func getAllGenres() : async [Genre] {
    genres.values().toArray();
  };

  public query func getAllComics() : async [Comic] {
    comics.values().toArray();
  };

  public query func getAllChapters() : async [Chapter] {
    chapters.values().toArray();
  };

  // Admin-only function to grab comic pages from URL
  public shared ({ caller }) func grabComicPages(url : Text) : async Text {
    requireAdmin(caller);
    try {
      await OutCall.httpGetRequest(url, [], transform);
    } catch (error) {
      Runtime.trap("Failed to grab pages: " # error.message());
    };
  };

  // HTTP Transformation Callback
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };
};
