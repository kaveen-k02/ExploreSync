import React, { useEffect, useState } from "react";
import { Avatar, Button, Tooltip, Input } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axios from "axios";
import UserService from "../../Services/UserService";
import { BASE_URL } from "../../constants";
import state from "../../Utils/Store";
// import "../Styles/CommentCard.css";

const CommentCard = ({ comment, currentUser, onUpdate, onDelete }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.commentText);
  const [isActionVisible, setIsActionVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentUser = comment.userId === currentUser?.uid;

  const fetchUserData = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      const result = await UserService.getProfileById(comment.userId);
      const result2 = await axios.get(`${BASE_URL}/users/${result.userId}`, config);
      setUserData({ ...result2.data, ...result });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [comment.userId]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(comment.id, editText);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = () => {
    if (userData) {
      state.selectedUserProfile = userData;
      state.friendProfileModalOpened = true;
    }
  };

  return (
    <div
      className="comment-item"
      onMouseEnter={() => isCurrentUser && setIsActionVisible(true)}
      onMouseLeave={() => isCurrentUser && setIsActionVisible(false)}
    >
      <div className="comment-container">
        <Avatar
          className="comment-avatar"
          onClick={handleUserClick}
          src={userData?.image}
          size={40}
        />
        <div style={{ flex: 1 }}>
          <div className="comment-user">{userData?.username || "User"}</div>

          {isEditing ? (
            <Input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onPressEnter={handleSave}
              autoFocus
              style={{
                marginBottom: "8px",
                background: "#333",
                color: "#e0e0e0",
                border: "1px solid #444",
              }}
            />
          ) : (
            <p className="comment-text">{comment.commentText}</p>
          )}

          <div className="comment-time">
            {comment.timestamp
              ? new Date(comment.timestamp.toDate()).toLocaleString()
              : "Just now"}
          </div>
        </div>

        {isCurrentUser && isActionVisible && !isEditing && (
          <div className="comment-actions">
            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined style={{ color: "#9932aa" }} />}
                onClick={() => setIsEditing(true)}
              />
            </Tooltip>
            <Tooltip title="Delete">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                loading={isLoading}
              />
            </Tooltip>
          </div>
        )}

        {isEditing && (
          <div className="edit-actions">
            <Button
              type="primary"
              onClick={handleSave}
              loading={isLoading}
              style={{ background: "#9932aa", borderColor: "#9932aa" }}
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditText(comment.commentText);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentCard;
