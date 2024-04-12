import { message, Table, Modal, Form, Input, Button, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import CryptoJS from "crypto-js";
import { GetAllUsers, UpdateUserPassword, UpdateUserRole } from "../../apicalls/users";
import { ShowLoader } from "../../redux/loaderSlice";

const { Option } = Select;
// ... (import statements remain the same)
// ... (import statements remain the same)

function UsersList() {
  const [users, setUsers] = useState([]);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [visibleRole, setVisibleRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const showUpdatePasswordModal = (user) => {
    setSelectedUser(user);
    setVisiblePassword(true);
  };

  const showUpdateRoleModal = (user) => {
    setSelectedUser(user);
    setVisibleRole(true);
  };

  const handleCancel = () => {
    setVisiblePassword(false);
    setVisibleRole(false);
  };

  const handleUpdatePassword = async () => {
    try {
      dispatch(ShowLoader(true));

      const response = await UpdateUserPassword(selectedUser?.id, newPassword);

      if (!response.success) {
        throw new Error(response.message);
      }

      dispatch(ShowLoader(false));
      message.success("Password updated successfully");
      getData();
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    } finally {
      setVisiblePassword(false);
    }
  };

  const handleUpdateRole = async () => {
    try {
      setLoading(true);

      const response = await UpdateUserRole(selectedUser?.id, newRole);

      if (!response.success) {
        throw new Error(response.message);
      }

      message.success("Role updated successfully");
      getData();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
      setVisibleRole(false);
    }
  };

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetAllUsers();
      dispatch(ShowLoader(false));
      if (response.success) {
        setUsers(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const nameMatch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = user.email.toLowerCase().includes(emailFilter.toLowerCase());
    return nameMatch && emailMatch;
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 200,
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 100,
    },
    {
      title: "Password",
      dataIndex: "password",
      width: 200,
      render: (text, user) => (
        <span>
          {CryptoJS.AES.decrypt(user.password, "sheyjobs-lite").toString(
            CryptoJS.enc.Utf8
          )}
        </span>
      ),
    },
    {
      title: "Actions",
      dataIndex: "actions",
      width: 200,
      render: (text, user) => (
        <div>
          <Button type="primary" onClick={() => showUpdatePasswordModal(user)}>
            Update Password
          </Button>
          <Button
            type="primary"
            onClick={() => showUpdateRoleModal(user)}
            style={{ marginLeft: 10 }}
          >
            Update Role
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Input
        placeholder="Search by name"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Input
        placeholder="Search by email"
        value={emailFilter}
        onChange={(e) => setEmailFilter(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <Table columns={columns} dataSource={filteredUsers} scroll={{ x: 1000, y: 500 }} />
      <Modal
        title="Update Password"
        visible={visiblePassword}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleUpdatePassword}>
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input the new password!",
              },
            ]}
          >
            <Input.Password onChange={(e) => setNewPassword(e.target.value)} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Password
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Update Role"
        visible={visibleRole}
        onCancel={handleCancel}
        footer={null}
      >
        <Form onFinish={handleUpdateRole}>
          <Form.Item
            label="New Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please select the new role!",
              },
            ]}
          >
            <Select
              style={{ width: 120 }}
              onChange={(value) => setNewRole(value)}
            >
              <Option value="client">Client</Option>
              <Option value="admin">Admin</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Role
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UsersList;
