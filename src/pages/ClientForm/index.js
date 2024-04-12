import { Col, Form, message, Row, DatePicker } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AddClient,
  CheckIfClientAccountIsApplied,
  GetClientById,
  UpdateClient,
} from "../../apicalls/clients"; // Updated import
import { ShowLoader } from "../../redux/loaderSlice";
import moment from "moment";

function ClientForm() {
  const [form] = Form.useForm();
  const [alreadyApproved, setAlreadyApproved] = useState(false);
  const [days, setDays] = useState([]);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [excludedDates, setExcludedDates] = useState([null]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      dispatch(ShowLoader(true));
      const payload = {
        ...values,
        days,
        userId: JSON.parse(localStorage.getItem("user")).id,
        status: "pending",
        role: "client",
        excludedDates,
      };
      let response = null;
      if (alreadyApproved) {
        payload.id = JSON.parse(localStorage.getItem("user")).id;
        payload.status = "approved";
        response = await UpdateClient(payload);
      } else {
        response = await AddClient(payload);
      }

      if (response.success) {
        message.success(response.message);
        navigate("/profile");
      } else {
        message.error(response.message);
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  const checkIfAlreadyApplied = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await CheckIfClientAccountIsApplied(
        JSON.parse(localStorage.getItem("user")).id
      );
      if (response.success) {
        setAlreadyApplied(true);
        if (response.data.status === "approved") {
          setAlreadyApproved(true);
          form.setFieldsValue(response.data);
          setDays(response.data.days);
        }
      } else {
        setAlreadyApplied(false);
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    checkIfAlreadyApplied();
  }, []);

  const handleExcludedDatesChange = (e) => {
    const inputDates = e.target.value.split(',').map(date => date.trim());
    const formattedDates = inputDates.map(date => moment(date, "YYYY-MM-DD").format("YYYY-MM-DD"));
    setExcludedDates(formattedDates);
  };

  return (
    <div className="bg-white p-2">
      {(!alreadyApplied || alreadyApproved) && (
        <>
          <h3 className="uppercase my-1">
            {alreadyApproved ? "Update your information" : "Apply as a client"}
          </h3>
          <hr />
          <Form layout="vertical" className="my-1" onFinish={onFinish} form={form}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <h4 className="uppercase">
                  <b>Personal Information</b>
                </h4>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="text" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="text" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="email" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Phone"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="number" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="Website"
                  name="website"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="text" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Address"
                  name="address"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <textarea type="text" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <hr />
              </Col>

              <Col span={24}>
                <h4 className="uppercase">
                  <b>Work Hours</b>
                </h4>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="Start Time"
                  name="startTime"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="time" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label="End Time"
                  name="endTime"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input type="time" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  label="Excluded Dates"
                  name="excludedDates"
                  rules={[
                    {
                      required: true,
                      message: "Required",
                    },
                  ]}
                >
                  <input
                    type="text"
                    placeholder="Enter excluded dates, separated by commas (YYYY-MM-DD)"
                    value={excludedDates.join(', ')}
                    onChange={handleExcludedDatesChange}
                  />
                </Form.Item>
                <div>
                  {/* Display the list of excluded dates with a button to remove each date */}
                  {excludedDates.map((date) => (
                    <div key={date}>
                      {date}
                      <button type="button" onClick={() => setExcludedDates((prevDates) => prevDates.filter((d) => d !== date))}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </Col>

              <Col span={20}>
                <Col span={24}>
                  <Form.Item
                    label="Excluded Slots"
                    name="excludedslots"
                    rules={[
                      {
                        required: true,
                        message: "Required",
                      },
                    ]}
                  >
                    <input type="text" placeholder="Enter excluded slots, separated by commas" />
                  </Form.Item>
                </Col>

                <Col span={10}>
                  <div className="flex flex-col flex-gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
                      <div className="flex items-center" key={index}>
                        <label style={{ minWidth: '80px', marginRight: '8px' }}>{day}</label>
                        <input
                          type="checkbox"
                          checked={days.includes(day)}
                          value={day}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDays([...days, e.target.value]);
                            } else {
                              setDays(days.filter((item) => item !== e.target.value));
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Col>
              </Col>
            </Row>

            <div className="flex justify-end gap-2">
              <button className="outlined-btn" type="button">
                CANCEL
              </button>
              <button className="contained-btn" type="submit">
                SUBMIT
              </button>
            </div>
          </Form>
        </>
      )}

      {alreadyApplied && !alreadyApproved && (
        <div className="flex flex-col items-center gap-2">
          <h3 className="text-secondary">
            You have already applied for this account, please wait for the admin to approve your request
          </h3>
        </div>
      )}
    </div>
  );
}

export default ClientForm;
