import React, { useEffect, useState } from "react";
import { Tabs, Card, Typography, Form, Input, Button, message } from "antd";
import Appointments from "./Appointments";
import ClientForm from "../ClientForm";
import moment from "moment";

import UserForm from './userForm';

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

 
  return (
    <div>
      <Tabs>
        <Tabs.TabPane tab="Appointments" key="1">
          <Appointments />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Profile" key="2">
          {user.role === "client" ? (
            <div>
              <ClientForm />
            </div>
          ) : (
            <div>
              <UserForm/>
            </div>
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}

export default Profile;
