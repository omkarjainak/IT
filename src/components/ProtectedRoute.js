import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from 'antd';
import { UserOutlined } from '@ant-design/icons'; // Correct import

function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="layout p-1">
      <div className="header bg-white p-2 flex justify-between items-center">
        <h2 className="cursor-pointer" onClick={() => navigate("/")}>
          <strong className="text-primary">IT</strong>
          <strong className="text-secondary"> App</strong>
        </h2>

        {user && (
          <div className="flex items-center"> 
            <UserOutlined style={{ marginRight: "0.5rem" }} />
            <h4
              style={{
                textTransform: "uppercase",
                cursor: "pointer",
                textDecoration: "underline",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                maxWidth: "7ch", 
                fontSize: "0.8rem", 
              }}
              title={user.name}
              onClick={() => {
                if (user.role === "admin") navigate("/admin");
                else navigate("/profile");
              }}
            >
              {user.name}
            </h4>
           
            <Button
              className="Button" 
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              LOGOUT
            </Button>
          </div>
        )}
      </div>
      <div className="content my-1">{children}</div>
    </div>
  );
}

export default ProtectedRoute;
