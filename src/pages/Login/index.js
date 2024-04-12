import React, { useState } from "react";
import { Button, Form, message, Drawer } from "antd";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { LoginUser } from "../../apicalls/users";
import { ShowLoader } from "../../redux/loaderSlice";
import BookAppointment from "../BookAppointment/guest";

import { Layout } from "antd";

const { Header, Content, Footer } = Layout;

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginDrawerVisible, setLoginDrawerVisible] = useState(false);
  const [bookAppointmentDrawerVisible, setBookAppointmentDrawerVisible] = useState(false);

  const onLoginFinish = async (values) => {
    try {
      dispatch(ShowLoader(true));
      const response = await LoginUser(values);
      dispatch(ShowLoader(false));
      if (response.success) {
        message.success(response.message);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...response.data,
            password: "",
          })
        );
        setLoginDrawerVisible(false);
        navigate("/");
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  return (
    <Layout className="layout ">
      <Header>
        <div className="flex flex-col  items-center justify-center">
          <div className="logo" style={{ color: "white", fontSize: "1.5em", fontWeight: "bold" }}>
            ITApp
          </div>
          </div>
          </Header>
         
        
      
      <Content style={{ padding: "50px" }}>
        <div className="site-layout-content">
          <div className="flex justify-center">
            <div className="mr-3">
            <div className="flex flex-col gap-3 items-center justify-center"  style={{height:"100%"}} >
              <p>GUEST APPOINTMENT BOOKING CLICK BELOW</p>
            <Button className="Button" onClick={() => setBookAppointmentDrawerVisible(true)}>
                Book Appointment
            </Button>
            
            <Button className="Button " onClick={() => setLoginDrawerVisible(true)}>
              Login
            </Button>
          </div>
            </div>
            <div className="flex items-center h-auto">
              <Drawer
                title="Login"
                placement="left"
                closable={true}
                onClose={() => setLoginDrawerVisible(false)}
                visible={loginDrawerVisible}
                width={400}
              >
                <LoginForm onFinish={onLoginFinish} />
                <Link className="underline" to="/register">
                  Don't have an account? <strong>Sign Up</strong>
                </Link>
              </Drawer>
              <Drawer
                title="Book Appointment"
                placement="right"
                closable={true}
                onClose={() => setBookAppointmentDrawerVisible(false)}
                visible={bookAppointmentDrawerVisible}
                width="auto"
              >
                <BookAppointment />
              </Drawer>
            </div>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}></Footer>
    </Layout>
  );
};

const LoginForm = ({ onFinish }) => {
  return (
    <Form layout="vertical" onFinish={onFinish}>
      <h2 className="uppercase my-1">
        <strong>Login</strong>
      </h2>
      <hr />
      <Form.Item label="Email" name="email" rules={[{ required: true, message: "Please enter your email" }]}>
        <input type="email" />
      </Form.Item>
      <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter your password" }]}>
        <input type="password" />
      </Form.Item>
      <button className="contained-btn my-1 w-full" type="submit">
        Login
      </button>
    </Form>
  );
};

export default Login;
