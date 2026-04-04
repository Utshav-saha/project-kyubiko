import React, { useState } from "react";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [action, setAction] = useState("Create an Account");
  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    pass: "",
    confirmPass: "",
    role: "curator",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (action === "Create an Account") {
      if (!data.firstName.trim()) {
        newErrors.firstName = "First Name is required";
      }

      if (!data.lastName.trim()) {
        newErrors.lastName = "Last Name is required";
      }

      if (!data.email.trim()) {
        newErrors.email = "Email is required";
      }
      if (!data.email.includes("@")) newErrors.email = "Invalid email";

      if (!data.pass.trim()) {
        newErrors.pass = "Password is required";
      }

      if (!data.confirmPass.trim()) {
        newErrors.confirmPass = "Confirm Password is required";
      }

      if (data.pass.trim() != data.confirmPass.trim()) {
        newErrors.confirmPass = "Password doesn't match";
      }

      if (data.pass.length < 6)
        newErrors.pass = "Password must be at least 6 chars";
    } else {
      if (!data.email) newErrors.email = "Email is required";
      if (!data.pass.trim()) newErrors.pass = "Email is required";
      if (!data.email.includes("@")) newErrors.email = "Invalid email";
    }

    return newErrors;
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop the page from refreshing

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert(Object.values(validationErrors).join("\n"));
      return;
    }

    setErrors({});
    setIsLoading(true);

    const url =
      action === "Create an Account"
        ? `${API_URL}/auth/register`
        : `${API_URL}/auth/login`;

    const payload =
      action === "Create an Account"
        ? data
        : {
            email: data.email,
            pass: data.pass,
          };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const parseRes = await response.json();

      if (parseRes.token) {
        localStorage.setItem("token", parseRes.token);
        localStorage.setItem("role", parseRes.role);
        localStorage.setItem("username", parseRes.username || "");
        localStorage.setItem("avatar_url", parseRes.avatar_url || "");

        console.log("Login success");
        if (parseRes.role === "curator") {
          navigate("/my-museums");
        } else {
          navigate("/manager-dashboard"); 
        }
      } else {
        alert(parseRes);
      }
    } catch (err) {
      console.error(err.message);
      alert("Server connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-chocolate w-full h-screen flex p-8 gap-30">
      <div className="w-1/2 h-full rounded-2xl overflow-hidden relative">
        <img
          src="/loginBg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />

        <div className="badge badge-xl badge-neutral absolute top-0 left-0 m-4">
          Kyubiko
        </div>
        <div className="badge badge-soft badge-xl badge-warning absolute top-0 right-0 m-4">
          Welcome Back !
        </div>
        <div className="absolute bottom-10 left-40 m-8 text-white">
          <h1 className="text-4xl font-bold font-dmsans">
            Preserving the past,
          </h1>
          <h1 className="text-4xl font-bold font-dmsans">
            inspiring the future.
          </h1>
        </div>
      </div>

      <div className=" w-1/3 h-full rounded-2xl relative">
        <div className="absolute top-20  text-white m-4">
          <h1 className="text-4xl font-bold font-dmsans">{action}</h1>
          <h4 className="mt-2">
            {action === "Create an Account"
              ? "Already have an account"
              : "Don't have an account"}{" "}
            ?{" "}
            <button
              className="cursor-pointer"
              onClick={() => {
                setAction(
                  action === "Create an Account"
                    ? "Login"
                    : "Create an Account",
                );
              }}
            >
              <u>
                {action === "Create an Account" ? "Login" : "Create an Account"}
              </u>
            </button>
          </h4>
        </div>

        <div className="absolute top-40 w-full p-4 mt-6">
          <form className="space-y-4">
            {action === "Login" ? (
              <div></div>
            ) : (
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  name="firstName"
                  value={data.firstName}
                  onChange={handleChange}
                  className="w-1/2 p-2 bg-[rgba(255,152,89,0.1)] rounded"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  name="lastName"
                  value={data.lastName}
                  onChange={handleChange}
                  className="w-1/2 p-2 bg-[rgba(255,152,89,0.1)] rounded "
                />
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={data.email}
                onChange={handleChange}
                className="w-full p-2 bg-[rgba(255,152,89,0.1)] rounded"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                name="pass"
                value={data.pass}
                onChange={handleChange}
                className="w-full p-2 bg-[rgba(255,152,89,0.1)] rounded"
              />
            </div>
            {action === "Create an Account" ? (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  name="confirmPass"
                  value={data.confirmPass}
                  onChange={handleChange}
                  className="w-full p-2 bg-[rgba(255,152,89,0.1)] rounded"
                />
              </div>
            ) : null}

            {action === "Login" ? (
              <div></div>
            ) : (
              <div className="gap-4 flex">
                <div>
                  <label className="curator">Curator</label>
                </div>
                <input
                  type="radio"
                  name="role"
                  value="curator"
                  checked={data.role === "curator"}
                  onChange={handleChange}
                  className="radio radio-warning"
                />
                <input
                  type="radio"
                  name="role"
                  value="manager"
                  checked={data.role === "manager"}
                  onChange={handleChange}
                  className="radio radio-warning mx-2"
                />

                <div>
                  <label className="museum">Museum Representative</label>
                </div>
              </div>
            )}
            <div>
              <button
                type="submit"
                className={`w-full p-2 bg-amber-500 text-white rounded hover:bg-amber-600 cursor-pointer mt-15 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
