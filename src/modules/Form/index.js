import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../../components/Btn";
import Input from "../../components/Input";
import Dashboard from "../../assets/dashboard.png";
import { useNavigate } from "react-router-dom";

const Form = ({ isLoginPage }) => {
  const [fullName, setFullName] = useState(""); // Hanya ada jika !isLoginPage
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = isLoginPage
      ? { email, password }
      : { fullName, email, password };

    const res = await fetch(
      `http://localhost:2001/api/${isLoginPage ? "login" : "register"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const resData = await res.json();

    if (resData.success) {
      if (resData.token) {
        localStorage.removeItem("token");
        localStorage.setItem("token", resData.token);
        localStorage.setItem("user", JSON.stringify(resData.user));
        toast.success("Login Success");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.success("Registration Success");
        setTimeout(() => {
          navigate("/users/login");
        }, 2000);
      }
    } else {
      toast.error(resData);
    }
  };

  return (
    <div className="flex bg-[#eeecec]">
      <ToastContainer position="top-left" />
      <div className="w-[600px] h-screen shadow-lg rounded-lg flex flex-col justify-center items-center">
        <div className="text-3xl font-extrabold">
          Welcome {isLoginPage && "Back"}
        </div>
        <div className="text-2xl font-light capitalize">socket.io</div>

        <form
          className="flex flex-col items-center w-1/2"
          onSubmit={handleSubmit}
        >
          {!isLoginPage && ( //(arti tanda !) jika isLoginPage false maka tampilkan
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              placeholder="Name"
              name="fullName"
              isRequired={true}
              className={"mt-10"}
            />
          )}
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            name="email"
            isRequired={true}
            className={"mt-5"}
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            name="password"
            isRequired={true}
            className={"mt-5"}
          />
          <Button
            label={isLoginPage ? "Login" : "Register"}
            type="submit"
            disabled={false}
            className="mt-5"
          />
        </form>

        <div className="capitalize">
          {isLoginPage ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() =>
              navigate(isLoginPage ? "/users/register" : "/users/login")
            }
            className="text-primary cursor-pointer underline"
          >
            {isLoginPage ? "Register" : "Login"}
          </span>
        </div>
      </div>

      <div className="w-[calc(100%-600px)] h-screen">
        <img
          className="w-full h-full object-cover"
          src={Dashboard}
          alt="dashboard"
        />
      </div>
    </div>
  );
};

export default Form;
