import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { IoMdRefresh } from "react-icons/io";
import event_ABI from "../artifacts/contracts/EventManagementSystem.sol/EventManagementSystem.json";
import { BsAlignCenter } from "react-icons/bs";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [eventManagement, setEventManagement] = useState(undefined);
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [maxRegistration, setMaxRegistration] = useState("");
  const [eventId, setEventId] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
  const eventABI = event_ABI.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);
    getEventManagementContract();
  };

  const getEventManagementContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const eventManagementContract = new ethers.Contract(contractAddress, eventABI, signer);

    setEventManagement(eventManagementContract);
    getEvents(); // Fetch events after contract is set
  };

  const getEvents = async () => {
    if (eventManagement) {
      const eventList = await eventManagement.getEventList();
      setEvents(eventList);
    }
  };

  const addEvent = async () => {
    if (eventManagement) {
      try {
        const tx = await eventManagement.addEvent(
          eventId,
          eventName,
          Math.floor(new Date(eventDate).getTime() / 1000),
          maxRegistration
        );
        await tx.wait();
        getEvents(); 
      } catch (error) {
        alert("An error occurred while adding the event: " + error.message); 
      }
    }
  };

  const updateEvent = async () => {
    if (eventManagement) {
      try {
        const tx = await eventManagement.updateEvent(
          eventId,
          eventName,
          Math.floor(new Date(eventDate).getTime() / 1000),
          maxRegistration
        );
        await tx.wait();
        getEvents(); 
      } catch (error) {
        alert("An error occurred while updating the event: " + error.message);
      }
    }
  };

  const cancelEvent = async () => {
    if (eventManagement) {
      try {
        const tx = await eventManagement.cancelEvent(eventId);
        await tx.wait();
        getEvents(); // Refresh the event list
      } catch (error) {
        alert("An error occurred while canceling the event: " + error.message); 
      }
    }
  };

  const clearEvents = async () => {
    if (eventManagement) {
        try {
            const tx = await eventManagement.clearEvents();
            await tx.wait();
            setEvents([]); 
            alert("All events cleared successfully!"); 
        } catch (error) {
            alert("An error occurred while clearing the events: " + error.message); 
        }
    }
};

  const initUser = () => {
    if (!ethWallet) {
      return <p style={style.errorMessage}>Please install Metamask in order to use this Event Management System.</p>;
    }

    if (!account) {
      return <button style={style.connect} onClick={connectAccount}>Connect to your MetaMask Wallet</button>;
    }

    return (
      <div>
    <div style={style.eventManagementContainer}>
      <h2 style={style.title}>Manage Events</h2>
      <div style={style.inputContainer}>
        <input
          style={style.input}
          type="number"
          placeholder="Event Id"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        />
        <input
          style={style.input}
          type="text"
          placeholder="Event Name"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
        />
        <input
          style={style.input}
          type="datetime-local"
          placeholder="Event Date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <input
          style={style.input}
          type="number"
          placeholder="Max Registration"
          value={maxRegistration}
          onChange={(e) => setMaxRegistration(e.target.value)}
        />
      </div>
      <div style={style.buttons}>
        <button style={style.button} onClick={addEvent}>Add Event</button>
        <button style={style.button} onClick={updateEvent}>Update Event</button>
        <button style={style.button} onClick={clearEvents}>Clear All Events</button>
      </div>
    </div>
    
    <div style={style.eventContainer}>
      <h3 style={style.title}>
        Event List: 
        <button onClick={getEvents}><IoMdRefresh /></button>
      </h3>
      <table style={style.table}>
        <thead>
          <tr>
            <th style={style.tableHeader}>Event ID</th>
            <th style={style.tableHeader}>Name</th>
            <th style={style.tableHeader}>Date</th>
            <th style={style.tableHeader}>Max Users</th>
            <th style={style.tableHeader}>Cancellation Status</th>
            <th style={style.tableHeader}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.eventId.toString()} style={style.tableRow}>
              <td style={style.tableData}>{event.eventId.toString()}</td>
              <td style={style.tableData}>{event.name}</td>
              <td style={style.tableData}>{new Date(event.date * 1000).toLocaleString()}</td>
              <td style={style.tableData}>{event.maxRegistration.toString()}</td>
              <td style={style.tableData}>{event.isCancelled ? "Cancelled" : "As Secheduled"}</td>
              <td style={style.tableData}>
                <button style={style.cancelButton} onClick={() => cancelEvent(event.eventId)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  // Styling object
  const style = {

    container: {
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#82e0aa",
      height: "1200px",
      padding: "20px",
      BsAlignCenter : "center",
      borderRadius: "15px",
      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
      minHeight: "100vh",
    },
    content: {
      textAlign: "left",
      margin: "10px",
    },
    connect: {
      textAlign: "center",
      left: "50%",
    },
    title: {
      color: "#34495e",
      margin: "20px 0",
      fontSize: "2rem",
      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)",
    },
    inputContainer: {
      margin: "20px 10px",
    },
    input: {
      padding: "14px",
      margin: "8px 5px",
      borderRadius: "10px",
      border: "1px solid #bdc3c7",
      width: "250px",
      fontSize: "16px",
      transition: "border-color 0.3s",
    },
    inputFocus: {
      borderColor: "#3498db",
      outline: "none",
    },
    buttons: {
      textAlign: "center",
      padding: "10px",
    },
    button: {
      padding: "12px 20px",
      margin: "8px 10px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#1abc9c",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s, transform 0.2s",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    },
    buttonHover: {
      backgroundColor: "#16a085",
      transform: "scale(1.05)",
    },
    eventManagementContainer: {
      marginLeft: "40%",
      marginTop: "20px",
      width: "300px",
      backgroundColor: "#ffffff",
      padding: "20px",
      borderRadius: "15px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
    },
    eventContainer: {
      height: "100px",
      padding: "20px",
      borderRadius: "15px"
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "20px",
      backgroundColor: "#fff",
      borderRadius : "15px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    tableHeader: {
      backgroundColor: "#85929e",
      color: "#fff",
      padding: "14px",
      textAlign: "left",
      borderBottom: "2px solid #2980b9",
      fontWeight: "bold",
    },
    tableRow: {
      borderBottom: "1px solid #e0e0e0",
      transition: "background-color 0.3s",
    },
    tableData: {
      padding: "12px",
      textAlign: "left",
      color: "#34495e",
    },
    tableRowHover: {
      backgroundColor: "#f1f1f1",
    },
    cancelButton: {
      padding: "10px 15px",
      marginTop: "10px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#e74c3c",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      transition: "background-color 0.3s, transform 0.2s",
    },
    cancelButtonHover: {
      backgroundColor: "#c0392b",
      transform: "scale(1.05)",
    },
    errorMessage: {
      color: "#e74c3c",
      fontWeight: "bold",
    },
  };
  

  return (
    <main style={style.container}>
      <header><h1>Blockchain Event Management</h1></header>
      <div style={style.content}>
        {initUser()}
      </div>
    </main>
  );
}
