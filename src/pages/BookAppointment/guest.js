import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { message, Input, Drawer, Select as AntSelect, Form } from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { GetClientById } from "../../apicalls/clients";
import { ShowLoader } from "../../redux/loaderSlice";
import {
  BookClientAppointment,
  GetClientAppointmentsOnDate,
} from "../../apicalls/appointments";

const { Option } = AntSelect;

function BookAppointment() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const id = "h0PDU8dIiNQ31CSommUl";
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [client, setClient] = useState(null);
  const [guestInfo, setGuestInfo] = useState({
    name: "",
    email: "",
  });
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reason, setReason] = useState("");

  const appointmentReasons = [
    "Development",
    "Approval",
    "Admission",
    "Courtesy Visit",
    "Bill Sanction",
    "Other",
  ];

  const areAllFieldsFilled = () => {
    if (!guestInfo.name || !guestInfo.email || !date || !selectedSlot || !reason) {
      return false;
    }

    if (reason === "Other" && !problem) {
      return false;
    }

    return true;
  };

  const onFinish = () => {
    setVisible(false);
    // Additional actions or navigation after appointment booking
  };

  const openDrawer = () => {
    setVisible(true);
  };

  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetClientById(id);
      if (response.success) {
        setClient(response.data);
      } else {
        message.error(response.message);
      }

      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  const getSlotsData = () => {
    if (!client || !client.days || !client.startTime || !client.endTime) {
      return <h3>Loading...</h3>;
    }

    const day = moment(date).format("dddd");
    const formattedExcludedDates = client.excludedDates.map(excludedDate =>
      moment(excludedDate).format("DD-MM-YYYY")
    );

    if (!client.days.includes(day) || formattedExcludedDates.includes(moment(date).format("DD-MM-YYYY"))) {
      return (
        <h3>
          {client.firstName} {client.lastName} is not available on{" "}
          {moment(date).format("DD-MM-YYYY")}
        </h3>
      );
    }

    let startTime = moment(client.startTime, "HH:mm");
    let endTime = moment(client.endTime, "HH:mm");
    let slotDuration = 15;

    const excludedSlots = client.excludedslots || [];
    const slots = [];

    while (startTime < endTime) {
      const slotTime = startTime.format("HH:mm");

      if (!excludedSlots.includes(slotTime)) {
        slots.push(slotTime);
      }

      startTime.add(slotDuration, "minutes");
    }

    return slots.map((slot) => {
      const isBooked = bookedSlots?.find(
        (bookedSlot) =>
          bookedSlot.slot === slot && bookedSlot.status !== "cancelled"
      );

      return (
        <div
          className="bg-white p-1 cursor-pointer"
          onClick={() => setSelectedSlot(slot)}
          style={{
            border:
              selectedSlot === slot ? "3px solid green" : "1px solid gray",
            backgroundColor: isBooked ? "gray" : "white",
            pointerEvents: isBooked ? "none" : "auto",
            cursor: isBooked ? "not-allowed" : "pointer",
          }}
          key={slot}
        >
          <span>
            {moment(slot, "HH:mm").format("hh:mm A")} -{" "}
            {moment(slot, "HH:mm").add(slotDuration, "minutes").format("hh:mm A")}
          </span>
        </div>
      );
    });
  };

  const onBookAppointment = async () => {
    try {
      dispatch(ShowLoader(true));

      if (!areAllFieldsFilled()) {
        message.error("Please fill in all required fields");
        dispatch(ShowLoader(false));
        return;
      }

      const isSlotBooked = bookedSlots?.some(
        (bookedSlot) =>
          bookedSlot.slot === selectedSlot && bookedSlot.status !== "cancelled"
      );

      if (isSlotBooked) {
        message.error("The selected slot is already booked. Please choose another slot.");
        dispatch(ShowLoader(false));
        return;
      }

      const payload = {
        clientId: client.id,
        userId: guestInfo.email,
        date,
        slot: selectedSlot,
        clientName: `${client.firstName} ${client.lastName}`,
        userName: guestInfo.name,
        bookedOn: moment().format("DD-MM-YYYY hh:mm A"),
        reason,
        problem,
        status: "pending",
        subrole: "guest",
      };
      const response = await BookClientAppointment(payload);
      if (response.success) {
        message.success(response.message);
        // Reload the page after successful booking
        window.location.reload();
      } else {
        message.error(response.message);
      }
      dispatch(ShowLoader(false));
    } catch (error) {
      message.error(error.message);
      dispatch(ShowLoader(false));
    }
  };

  const getBookedSlots = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetClientAppointmentsOnDate(id, date);
      dispatch(ShowLoader(false));
      if (response.success) {
        setBookedSlots(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(ShowLoader(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  useEffect(() => {
    if (date) {
      getSlotsData();
      getBookedSlots();
    }
  }, [date]);

  return (
    
     

      <div className="flex flex-col gap-1 my-2">
      
          <h1 className="uppercase my-1">
            <b>
              {client?.firstName} {client?.lastName}
            </b>
          </h1>
          <hr />

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm">
                <b>Email : </b>
              </h4>
              <h4 className="text-sm">{client?.email}</h4>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-sm">
                <b>Phone : </b>
              </h4>
              <h4 className="text-sm">{client?.phone}</h4>
            </div>
            <div className="flex flex-col gap-2">
              <h4 className="text-sm">
                <b>Address : </b>
              </h4>
              <h4 className="text-sm">{client?.address}</h4>
            </div>
          </div>

          <hr />
          {/* Guest information form */}
          <Form onFinish={onFinish}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please enter your name",
                },
              ]}
            >
              <Input
                placeholder="Name"
                value={guestInfo.name}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, name: e.target.value })
                }
              />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter your email",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address",
                },
              ]}
            >
              <Input
                placeholder="Email"
                type="email"
                value={guestInfo.email}
                onChange={(e) =>
                  setGuestInfo({ ...guestInfo, email: e.target.value })
                }
              />
            </Form.Item>

            <div className="flex flex-col gap-1 my-2">
              <div className="flex gap-2 w-400 items-end">
                <div>
                  <span>Select Date :</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={moment().format("YYYY-MM-DD")}
                  />
                </div>
              </div>

              <div style={{ overflowY: "auto", maxHeight: "300px" }}>
                <div className="flex gap-2">{date && getSlotsData()}</div>
              </div>

              {selectedSlot && (
                <div>
                  <AntSelect
                    placeholder="Select Appointment Reason"
                    style={{ marginBottom: 16, width: "100%" }}
                    onChange={(value) => setReason(value)}
                  >
                    {appointmentReasons.map((reason) => (
                      <Option key={reason} value={reason}>
                        {reason}
                      </Option>
                    ))}
                  </AntSelect>

                  {reason === "Other" && (
                    <Input
                      placeholder="Specify Reason"
                      value={problem}
                      onChange={(e) => setProblem(e.target.value)}
                    />
                  )}

                  <div className="flex gap-2 justify-center my-3">
                    <button
                      className="outlined-btn"
                      onClick={() => {
                        navigate("/");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="contained-btn"
                      onClick={onBookAppointment}
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Form>
       

        
      </div>
   
  );
}

export default BookAppointment;
