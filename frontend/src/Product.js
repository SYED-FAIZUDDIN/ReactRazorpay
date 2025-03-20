import Tshirt from "./images/Tshirt.png";
import ysiLogo from "./images/ysi_logo.jpg";

const Product = () => {
  /* 
    Amount is in currency subunits.
    Default currency is INR.
    Example: 500 * 100 refers to 50000 paise = 500 rupees
  */
  const amount = 500 * 100;
  const currency = "INR";
  const receipt = "Receipt";

  // To handle payment button
  const paymentHandler = async (e) => {
    const response = await fetch("http://localhost:5000/orders", {
      method: "POST",
      body: JSON.stringify({
        amount,
        currency,
        receipt: receipt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let order = "";
    if (response.ok) {
      order = await response.json();
    } else {
      console.error("Payment failed");
    }
    var options = {
      key: "test_id", // Enter the Key ID generated from the Razorpay Dashboard
      amount: amount,
      currency: currency,
      name: "YoungSoft India", // Busineess/Company name
      description: "Test Transaction",
      image: ysiLogo,
      order_id: order.id, //Order id obtained from the response of /orders API
      handler: async function (response) {
        /*
          After successful processing of the transaction
          validating the transaction using /orders/validate API call
        */
        const body = { ...response };
        const validateResponse = await fetch(
          "http://localhost:5000/orders/validate",
          {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const jsonRes = await validateResponse.json();
        if (jsonRes.message === "success") {
          alert("Payment success");
        } else {
          alert("Payment fail");
        }
      },
      // Provide the customer details 
      prefill: {
        name: "WEB DEV", // Name of the customer
        email: "webdev@example.com", // Email of the customer
        contact: "9000000000", // Mobile number of the customer
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#FFD700", // theme of the razorpay template
      },
    };
    var razorpay = new window.Razorpay(options);
    razorpay.on("payment.failed", function (response) {
      alert(response.error.reason);
    });
    razorpay.open();
    e.preventDefault();
  };

  return (
    <div className="product">
      <h2>T-Shirt</h2>
      <p>Solid red cotton T-Shirt</p>
      <img src={Tshirt} />
      <br />
      <button onClick={paymentHandler}>Pay &#x20B9;500</button>
    </div>
  );
};

export default Product;
