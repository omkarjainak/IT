import React, { useEffect, useState } from "react";
import { Card, Typography, Form, Input, Button, message, Select } from "antd";
import { saveUserData, GetUserById } from "../../apicalls/users";
const { Title, Text } = Typography;
const { Option } = Select;

function UserForm() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [form] = Form.useForm();
  const [userData, setUserData] = useState({}); // State to store user data
  const [subrole, setSubrole] = useState(null); // State to store selected subrole

  const getUserProfileData = async () => {
    try {
      const response = await GetUserById(user.id);
      if (response.success) {
        setUserData(response.data);
        form.setFieldsValue(response.data);
        setSubrole(response.data.subrole); // Assuming subrole is in the response
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    getUserProfileData();
  }, []);

  const onFinish = async (values) => {
    try {
      const updatedData = {
        ...values,
        subrole: subrole, // Add the subrole to the updated data
      };

      await saveUserData(user.id, updatedData);
      // Update the state with the new user data
      setUserData((prevData) => ({
        ...prevData,
        ...updatedData,
      }));
      message.success("User details updated successfully!");
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubroleChange = (value) => {
    setSubrole(value);
  };

  return (
    <div>
      <Card title="User Details">
        <Title level={4}>Name: {user.name}</Title>
        <Text>Email: {user.email}</Text>
      </Card>
      <Card title="Select Subrole">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          initialValues={userData}
        >
          <Form.Item
            label="Subrole"
            name="subrole"
            rules={[
              {
                required: true,
                message: "Please select a subrole",
              },
            ]}
          >
            <Select onChange={handleSubroleChange}>
              <Option value="staff">Staff</Option>
              <Option value="student">Student</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Next
            </Button>
          </Form.Item>
        </Form>
      </Card>
      {subrole && (
        <Card title={`Update ${subrole} Details`}>
          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            initialValues={userData}
          >
            <Form.Item
              label={`${subrole === "staff" ? "Staff" : "Student"} ID`}
              name={subrole === "staff" ? "staffId" : "stdId"}
              rules={[
                {
                  required: true,
                  message: "This field is required",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Contact"
              name="contact"
              rules={[
                {
                  required: true,
                  message: "This field is required",
                },
              ]}
            >
              <Input />
            </Form.Item>
            {subrole === "student" && (
              <>
                <Form.Item
                  label="Branch"
                  name="branch"
                  rules={[
                    {
                      required: true,
                      message: "Please select a branch",
                    },
                  ]}
                >
                  <Select>
                    <Option value="IT">Information Technology</Option>
                    <Option value="CS">Computer Science</Option>
                    {/* Add more branches as needed */}
                  </Select>
                </Form.Item>
                <Form.Item
                  label="Year"
                  name="year"
                  rules={[
                    {
                      required: true,
                      message: "Please select a year",
                    },
                  ]}
                >
                  <Select>
                    <Option value="FE">First Year</Option>
                    <Option value="SE">Second Year</Option>
                    <Option value="TE">Third Year</Option>
                    <Option value="BE">Fourth Year</Option>
                  </Select>
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Update
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
}

export default UserForm;
