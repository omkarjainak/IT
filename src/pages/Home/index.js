import { Col, message, Row } from "antd";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetAllClients } from "../../apicalls/clients";
import { ShowLoader } from "../../redux/loaderSlice";
import Appointments from './../Profile/Appointments';

function Home() {
  const [client = [], setClient] = React.useState([]);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));
  const getData = async () => {
    try {
      dispatch(ShowLoader(true));
      const response = await GetAllClients();
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

  useEffect(() => {
    getData();
  }, []);
  const navigate = useNavigate();
  return (
    <div className="p-1">
      
      <div className="flex justify-between items-center mb-4">
       
        {user?.role !== "user" && (
          <button
            className="outlined-btn"
            onClick={() => navigate("/apply-client")}
          >
            Apply Appointments
          </button>
        )}
      </div>

      {/* Main Content */}
      {user && (
        <Row gutter={[16, 16]} className="my-1">
          {client.map((client) => (
            <Col span={24} sm={12} md={8} lg={8} xl={8} key={client.id}>
              <div
                className="bg-white p-2 flex flex-col gap-2 cursor-pointer"
                onClick={() => navigate(`/book-appointment/${client.id}`)}
              >
                <h2 className="uppercase text-xl font-bold">
                  {client.firstName} {client.lastName}
                </h2>
                <hr className="my-2" />
                <div className="flex justify-between w-full">
                  <div>
                    <h4>
                      <b>Email : </b>
                    </h4>
                    <p>{client.email}</p>
                  </div>
                  <div>
                    <h4>
                      <b>Phone : </b>
                    </h4>
                    <p>{client.phone}</p>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}

export default Home;
