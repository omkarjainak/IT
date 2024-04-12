import { message, Input, Select } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import moment from "moment";
import {
  BookClientAppointment,
  GetClientAppointmentsOnDate,
} from "../../apicalls/appointments"; // Updated import
import { GetClientById } from "../../apicalls/clients"; // Updated import
import { ShowLoader } from "../../redux/loaderSlice";
import { useNavigate, useParams } from "react-router-dom";
import {GetUserById} from "../../apicalls/users"
const { Option } = Select;

function BookAppointment() {
  const [problem, setProblem] = useState("");
  const [date, setDate] = useState("");
  const [client, setClient] = useState(null); // Updated variable name
  const [selectedSlot, setSelectedSlot] = useState("");
  const [subrole, setSubrole] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [reason, setReason] = useState("");
  const [fieldsFilled, setFieldsFilled] = useState(false);
 

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const appointmentReasons = [
    "Development",
    "Approval",
    "Admission",
    "Courtesy Visit",
    "Bill Sanction",
    "Other",
  ];

  const getUserSubrole = async () => {
    try {
      const response = await GetUserById(JSON.parse(localStorage.getItem("user")).id);
      if (response.success) {
        setSubrole(response.data.subrole);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (id) {
      getUserSubrole(id);
    }
  }, [id]);
  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetClientById(id); // Updated function name
      if (response.success) {
        setClient(response.data); // Updated variable name
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
        >
          <span>
            {moment(slot, "HH:mm").format("hh:mm A")} -{" "}
            {moment(slot, "HH:mm")
              .add(slotDuration, "minutes")
              .format("hh:mm A")}
          </span>
        </div>
      );
    });
  };
  
  const onBookAppointment = async () => {
    try {
      dispatch(ShowLoader(true));
      const payload = {
        clientId: client.id, // Updated property name
        userId: JSON.parse(localStorage.getItem("user")).id,
        date,
        slot: selectedSlot,
        clientName: `${client.firstName} ${client.lastName}`, // Updated property name
        userName: JSON.parse(localStorage.getItem("user")).name,
        bookedOn: moment().format("DD-MM-YYYY hh:mm A"),
        reason,
        problem,
        status: "pending",
        subrole,
      };

      const response = await BookClientAppointment(payload); // Updated function name
      if (response.success) {
        message.success(response.message);
        navigate("/profile");
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
      const response = await GetClientAppointmentsOnDate(id, date); // Updated function name
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
      getBookedSlots();
    }
  }, [date]);

  useEffect(() => {
    // Check if all required fields are filled
    if (date && selectedSlot && reason && subrole) {
      setFieldsFilled(true);
    } else {
      setFieldsFilled(false);
    }
  }, [date, selectedSlot, reason, subrole]);

  return (
    client && (
      <div className="bg-white p-2">
        <h1 className="uppercase my-1">
          <b>
            {client?.firstName} {client?.lastName} {/* Updated variable name */}
          </b>
        </h1>

        <hr />

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            {/* Content */}
          </div>
          <div className="flex flex-col gap-2">
            {/* Content */}
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm">
              <b>Email : </b>
            </h4>
            <h4 className="text-sm">{client.email}</h4>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm">
              <b>Phone : </b>
            </h4>
            <h4 className="text-sm">{client.phone}</h4>
          </div>
          <div className="flex flex-col gap-2">
            <h4 className="text-sm">
              <b>Address : </b>
            </h4>
            <h4 className="text-sm">{client.address}</h4>
          </div>
        </div>

        <hr />

        <div className="flex gap-2 w-auto items-end">
          <div>
            <span>Subrole :</span>
           <p>{subrole}</p>
          
          </div>
        </div>

        {/* Slots section */}
        <div className="flex flex-col gap-2 my-2">
          <div className="flex gap-2 w-auto items-end">
            <div>
              <span>Select Date :</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={moment().format("YYYY-MM-DD")}
                required
              />
            </div>
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
            <div className="flex gap-1">{date && getSlotsData()}</div>
          </div>

          {selectedSlot && (
            <div>
              <Select
                placeholder="Select Appointment Reason"
                style={{ width: "100%", marginBottom: 16 }}
                onChange={(value) => setReason(value)}
                required
              >
                {appointmentReasons.map((reason) => (
                  <Option key={reason} value={reason}>
                    {reason}
                  </Option>
                ))}
              </Select>

              {reason === "Other" && (
                <Input
                  placeholder="Specify Reason"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  required
                />
              )}

              {!problem && reason === "Other" && (
                <p style={{ color: "red" }}>Please fill in the problem field.</p>
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
                  disabled={!fieldsFilled || (!problem && reason === "Other")}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default BookAppointment;
