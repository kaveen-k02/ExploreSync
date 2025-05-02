import React, { useState, useEffect } from "react";
import UserService from "../../Services/UserService";
import LikeService from "../../Services/LikeService";
import { useSnapshot } from "valtio";
import state from "../../Utils/Store";
import CommentService from "../../Services/CommentService";
import {
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  LikeOutlined,
  LikeFilled,
  CommentOutlined
} from "@ant-design/icons";
import {
  Button,
  Modal,
  List,
  Input,
  Avatar,
  Dropdown,
  Menu,
  message,
  Divider,
  Badge
} from "antd";
import PostService from "../../Services/PostService";
import CommentCard from "./CommentCard";
// import "./CommentCard.css";

// Make the state globally available for the CommentCard component
window.state = state;
window.message = message;

const FriendsPost = ({ post }) => {
  const snap = useSnapshot(state);
  const [userData, setUserData] = useState();
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [commentAdding, setCommentAdding] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const userLiked = likes.some((like) => like.userId === snap.currentUser?.uid);
    setIsLiked(userLiked);
  }, [likes, snap.currentUser]);

  useEffect(() => {
    if (!post.id) {
      console.warn("Post without ID detected:", post);
    }
  }, [post]);

  useEffect(() => {
    UserService.getProfileById(post.userId)
      .then((value) => {
        setUserData(value);
      })
      .catch((err) => {
        console.log(`error getting user data ${err}`);
      });
    getLikesRelatedToPost();
    getCommentsRelatedToPost();
  }, [post]);

  const updatePost = () => {
    state.selectedPost = post;
    state.updatePostModalOpened = true;
  };

  const deletePost = async () => {
    try {
      await PostService.deletePost(post.id);
      state.posts = await PostService.getPosts();
      message.success("Post deleted successfully");
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const menu = (
    <Menu>
      <Menu.Item onClick={updatePost} key="edit" icon={<EditOutlined />}>
        Edit
      </Menu.Item>
      <Menu.Item onClick={deletePost} key="delete" icon={<DeleteOutlined />} danger>
        Delete
      </Menu.Item>
    </Menu>
  );

  const getLikesRelatedToPost = async () => {
    try {
      const result = await LikeService.getLikesByPostId(post.id);
      setLikes(result);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const getCommentsRelatedToPost = async () => {
    try {
      const result = await CommentService.getCommentsByPostId(post.id);
      setComments(result);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async () => {
    try {
      await LikeService.createLike(
        {
          postId: post.id,
          userId: snap.currentUser?.uid,
        },
        snap.currentUser?.username,
        post.userId
      );
      getLikesRelatedToPost();
    } catch (error) {
      message.error("Error liking post");
    }
  };

  const handleUnlike = async () => {
    try {
      const likeToRemove = likes.find(
        (like) => like.userId === snap.currentUser?.uid
      );
      if (likeToRemove) {
        await LikeService.deleteLike(likeToRemove.id);
        getLikesRelatedToPost();
      }
    } catch (error) {
      message.error("Error unliking post");
    }
  };

  const toggleLike = () => {
    if (isLiked) {
      handleUnlike();
    } else {
      handleLike();
    }
  };

  const createComment = async () => {
    if (comment) {
      try {
        setCommentAdding(true);
        const body = {
          postId: post.id,
          userId: snap.currentUser?.uid,
          commentText: comment,
        };
        await CommentService.createComment(
          body,
          snap.currentUser?.username,
          post.userId
        );
        setComment("");
        await getCommentsRelatedToPost();
      } catch (error) {
        message.error("Failed to add comment");
      } finally {
        setCommentAdding(false);
      }
    }
  };

  const updateComment = async (commentId, newText) => {
    try {
      await CommentService.updateComment(commentId, {
        commentText: newText,
      });
      await getCommentsRelatedToPost();
      return true;
    } catch (error) {
      message.error("Failed to update comment");
      return false;
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await CommentService.deleteComment(commentId);
      await getCommentsRelatedToPost();
      message.success("Comment deleted");
      return true;
    } catch (error) {
      message.error("Failed to delete comment");
      return false;
    }
  };

  return (
    <div className="">
      <div className="post-header">
        <div className="user-info">
          <Avatar
            src={userData?.image}
            size={48}
            className="user-avatar"
            onClick={() => {
              if (userData?.profileVisibility) {
                state.selectedUserProfile = userData;
                state.friendProfileModalOpened = true;
              } else {
                message.info("Profile is locked");
              }
            }}
          />
          <div className="user-details">
            <h3 className="username">{userData?.username}</h3>
            <span className="post-time">Posted recently</span>
          </div>
        </div>
        {post.userId === snap.currentUser?.uid && (
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} className="more-options" />
          </Dropdown>
        )}
      </div>

      {post.contentDescription && (
        <div className="post-content">
          <p>{post.contentDescription}</p>
        </div>
      )}

      {post.mediaType === "image" && (
        <div className="post-media">
          <img src={post?.mediaLink} alt="Post content" />
        </div>
      )}

      {post.mediaType === "video" && (
        <div className="post-media">
          <video controls src={post?.mediaLink} />
        </div>
      )}

      <div className="post-stats">
        <div className="likes-count">
          <Badge count={likes.length} showZero color="#1890ff" offset={[10, 0]}>
            <LikeOutlined style={{ fontSize: '16px' }} />
          </Badge>
        </div>
        <div 
          className="comments-count cursor-pointer" 
          onClick={() => setShowCommentModal(true)}
        >
          <Badge count={comments.length} showZero color="#52c41a" offset={[10, 0]}>
            <CommentOutlined style={{ fontSize: '16px' }} />
          </Badge>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className="post-actions">
        <div className="action-buttons">
          <button 
            className={`interaction-button ${isLiked ? 'liked' : ''}`}
            onClick={toggleLike}
          >
            {isLiked ? <LikeFilled /> : <LikeOutlined />}
            <span>{isLiked ? 'Liked' : 'Like'}</span>
          </button>
          
          <button 
            className="interaction-button"
            onClick={() => setShowCommentModal(true)}
          >
            <CommentOutlined />
            <span>Comment</span>
          </button>
        </div>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div className="comment-input">
        <Avatar src={snap.currentUser?.image} size={36} />
        <Input
          placeholder="Write a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onPressEnter={createComment}
          className="custom-comment-input"
        />
        <Button
          type="primary"
          shape="circle"
          icon={<SendOutlined />}
          onClick={createComment}
          disabled={!comment}
          loading={commentAdding}
        />
      </div>

      <Modal
        title="Comments"
        open={showCommentModal}
        footer={null}
        onCancel={() => setShowCommentModal(false)}
        className="comments-modal"
        destroyOnClose={true}
      >
        <List
          className="comments-list"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              currentUser={snap.currentUser}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          )}
          locale={{ emptyText: "No comments yet. Be the first to comment!" }}
        />       
      </Modal>
    </div>
  );
};

export default FriendsPost;