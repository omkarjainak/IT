// Appointments.jsx

import React, { useState, useEffect } from "react";
import { message, Table, Space, Button, Input, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import {
  GetClientAppointments,
  GetUserAppointments,
  UpdateAppointmentStatus,
} from "../../apicalls/appointments";
import { GetUserById } from "../../apicalls/users"; // Import the GetUserById function
import { useDispatch } from "react-redux";
import { ShowLoader } from "../../redux/loaderSlice";
import emailjs from "emailjs-com";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filterDate, setFilterDate] = useState(moment().format("YYYY-MM-DD"));
  const [hoveredUser, setHoveredUser] = useState(null);
  const [hoveredUserData, setHoveredUserData] = useState(null); // State to store additional user info
  const user = JSON.parse(localStorage.getItem("user"));

  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      let response;

      if (user.role === "client") {
        response = await GetClientAppointments(user.id);
      } else {
        response = await GetUserAppointments(user.id);
      }

      if (response.success) {
        let filteredAppointments = response.data;

        if (filterDate) {
          filteredAppointments = response.data.filter(
            (appointment) =>
              moment(appointment.date).isSame(filterDate, "YYYY-MM-DD")
          );
        }

        setAppointments(filteredAppointments);
      } else {
        message.error(response.message);
      }

      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  const onUpdate = async (id, status, subrole, guestEmail, appointmentDate, appointmentTime, userName, clientName) => {
    try {
      dispatch(ShowLoader(true));
    
      if (status === "sendEmail" && subrole === "guest") {
        const templateId = "template_ugv0jef";
        const params = {
          to_name: userName,
          from_name: clientName,
         
          appointmentDate: appointmentDate, 
          appointmentTime: appointmentTime,
        };
    
        await sendEmail(templateId, params);
      }
    
      const response = await UpdateAppointmentStatus(id, status);
      if (response.success) {
        message.success(response.message);
        getData();
      } else {
        message.error(response.message);
      }
    
      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };
  
  const sendEmail = async (templateId, params) => {
    try {
      params.message = `Appointment Date: ${params.appointmentDate}\nAppointment Time: ${params.appointmentTime}`;

      await emailjs.send(
        "service_6ckivzn",
        templateId,
        params,
        "pJAhI2JyWsQTnc69S"
      );
      message.success("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      message.error("Error sending email");
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const response = await GetUserById(userId);
      if (response.success) {
        setHoveredUserData(response.data);
      } else {
        console.error("Error fetching user profile:", response.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error.message);
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => moment(a.date).unix() - moment(b.date).unix(),
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Enter Date"
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Button
            type="primary"
            onClick={() => {
              confirm();
              getData();
            }}
            icon={<SearchOutlined />}
          >
            Search
          </Button>
          <Button onClick={() => {
            clearFilters();
            setFilterDate(null);
            getData();
          }} style={{ marginLeft: 8 }}>
            Reset
          </Button>
        </div>
      ),
      onFilter: (value, record) =>
        moment(record.date).isSame(moment(value, "YYYY-MM-DD")),
      render: (text, record) => moment(record.date).format("YYYY-MM-DD"),
    },
    {
      title: "Time",
      dataIndex: "slot",
      sorter: (a, b) => moment(a.slot, "HH:mm").unix() - moment(b.slot, "HH:mm").unix(),
    },
    {
      title: "User INFO(click on userID)",
      dataIndex: "userId",
      render: (text, record) => (
        <>
          {record.subrole !== "guest" && (
            <Tooltip
              title={hoveredUser && (
                <div style={{ position: 'absolute', top: hoveredUser.offsetTop + hoveredUser.clientHeight, left: hoveredUser.offsetLeft, border: '1px solid #ddd', padding: '8px', background: '#fff', zIndex: 999, boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
                  {/* Render user profile details here */}
                  <p><strong>User Profile Details:</strong></p>
                  <p>Name: {hoveredUserData?.name}</p>
                  <p>Email: {hoveredUserData?.email}</p>
                  {hoveredUserData?.subrole === 'student' && (
                    <>
                      <p>stdid: {hoveredUserData?.stdId}</p>
                      <p>branch: {hoveredUserData?.branch}</p>
                      <p>year: {hoveredUserData?.year}</p>
                    </>
                  )}
                  {hoveredUserData?.subrole === 'staff' && (
                    <>
                      <p>staffid: {hoveredUserData?.staffId}</p>
                      
                    </>
                  )}
                </div>
              )}
              onMouseEnter={() => {
                setHoveredUser(record);
                fetchUserProfile(record.userId);
              }}
            >
              
              <span>{text}</span>
            </Tooltip>
          )}
          {record.subrole === "guest" && <span>{text}</span>}
        </>
      ),
    },
    {
      title: "User Name",
      dataIndex: "userName",
      filters: [
        ...new Set(appointments.map((appointment) => appointment.userName)),
      ].map((student, index) => ({ text: student, value: student, key: index })),
      onFilter: (value, record) => record.userName.includes(value),
    },
    {
      title: "Reason",
      dataIndex: "reason",
    },
    {
      title: "Problem",
      dataIndex: "problem",
    },
    {
      title: "Status",
      dataIndex: "status",
      filters: [
        ...new Set(appointments.map((appointment) => appointment.status)),
      ].map((status, index) => ({ text: status, value: status, key: index })),
      onFilter: (value, record) => record.status.includes(value),
    },
  ];
  if (user.role === "client") {
    columns.unshift(
      {
        title: "Subrole",
        dataIndex: "subrole",
        filters: [
          ...new Set(appointments.map((appointment) => appointment.subrole)),
        ].map((subrole, index) => ({ text: subrole, value: subrole, key: index })),
        onFilter: (value, record) => record.subrole.includes(value),
      },
      {
        title: "Action",
        dataIndex: "action",
        render: (text, record) => {
          if (user.role === "client" && record.subrole !== "guest") {
            return (
              <Space size="small">
                <span
                  className="underline cursor-pointer"
                  onClick={() => onUpdate(record.id, "ok")}
                >
                  Ok
                </span>
                <span
                  className="underline cursor-pointer"
                  onClick={() => onUpdate(record.id, "callMe")}
                >
                  Call me
                </span>
                <span
                  className="underline cursor-pointer"
                  onClick={() => onUpdate(record.id, "textMe")}
                >
                  Text me
                </span>
                <span
                  className="underline cursor-pointer"
                  onClick={() => onUpdate(record.id, "meetLater")}
                >
                  Meet me later
                </span>
              </Space>
            );
          } else if (user.role === "client" && record.subrole === "guest") {
            return (
              <Space size="small">
  <span
    className="underline cursor-pointer"
    onClick={() => onUpdate(record.id, "sendEmail", record.subrole, record.guestEmail, record.date, record.slot, record.userName, record.clientName)}
  >
    Send Email
  </span>
</Space>

            );
          } else {
            return null;
          }
        },
      }
    );
  }
  useEffect(() => {
    getData();
  }, [filterDate]);
  

  return (
    <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
      <Table columns={columns} dataSource={appointments || []} />
    
     
        </div>
     
  );
};

export default Appointments;
