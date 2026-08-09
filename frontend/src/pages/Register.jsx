import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import api from "../api/client";

const CATEGORIES = [
  "Electrician",
  "AC Sale/Purchase & Repair",
  "Plumber",
  "Carpenter",
  "Painter",
  "Home Shifting",
  "Electronics Shop",
  "Mobile Repair",
  "Tailor / Boutique",
  "Grocery / General Store",
  "Other",
];

const initialState = {
  role: "buyer",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  cnicNumber: "",
  address: "",
  city: "",
  area: "",
  businessName: "",
  category: "",
  bankAccountTitle: "",
  bankAccountNumber: "",
  bankName: "",
};

const Register = () => {
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState({ idCardFrontImage: null, idCardBackImage: null, profilePicture: null });
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Aapka browser location detect nahi kar sakta");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError("Location access nahi mil saka. Browser settings mein allow karein.");
      }
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Password aur confirm password match nahi kar rahe");
      return;
    }
    if (!files.idCardFrontImage || !files.idCardBackImage) {
      setError("ID Card ki front aur back tasveer lazmi hai");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "confirmPassword") fd.append(key, value);
      });
      if (coords) {
        fd.append("latitude", coords.lat);
        fd.append("longitude", coords.lng);
      }
      Object.entries(files).forEach(([key, file]) => {
        if (file) fd.append(key, file);
      });

      const res = await api.post("/auth/register", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/verify-otp", { state: { phone: res.data.phone } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration mein masla hua, dobara koshish karein");
    } finally {
      setLoading(false);
    }
  };

  const isSellerOrShop = form.role === "seller" || form.role === "shop";

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Apni services ya shop, lakhon logon tak pohanchayein.</h2>
        <p>
          PiaraPakistan par register karein — buyer ho ya seller, har account
          verify hota hai taake platform sab k liye mehfooz rahe.
        </p>
      </div>

      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Account banayein</h1>
          <p className="subtitle">Sirf 2 minute mein — mehfooz aur asaan</p>

          <div className="role-tabs">
            {["buyer", "seller", "shop"].map((r) => (
              <div
                key={r}
                className={`role-tab ${form.role === r ? "active" : ""}`}
                onClick={() => setForm({ ...form, role: r })}
              >
                {r === "buyer" ? "Buyer" : r === "seller" ? "Service Seller" : "Shop Owner"}
              </div>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="section-label">Basic Information</div>
            <div className="form-grid">
              <div className="field">
                <label>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input
                  name="phone"
                  placeholder="+92 3XX XXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="section-label">Verification (ID Card / CNIC)</div>
            <div className="form-grid">
              <div className="field full">
                <label>CNIC Number</label>
                <input
                  name="cnicNumber"
                  placeholder="XXXXX-XXXXXXX-X"
                  value={form.cnicNumber}
                  onChange={handleChange}
                  required
                />
                <span className="field-hint">Fraud rokne aur trust ke liye har user ki verification zaroori hai.</span>
              </div>
              <div className="field">
                <label>ID Card - Front</label>
                <label
                  className={`file-upload-box ${files.idCardFrontImage ? "has-file" : ""}`}
                  htmlFor="idFront"
                >
                  {files.idCardFrontImage ? files.idCardFrontImage.name : "Click to upload (jpg/png)"}
                </label>
                <input
                  id="idFront"
                  type="file"
                  name="idCardFrontImage"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                  required
                />
              </div>
              <div className="field">
                <label>ID Card - Back</label>
                <label className={`file-upload-box ${files.idCardBackImage ? "has-file" : ""}`} htmlFor="idBack">
                  {files.idCardBackImage ? files.idCardBackImage.name : "Click to upload (jpg/png)"}
                </label>
                <input
                  id="idBack"
                  type="file"
                  name="idCardBackImage"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                  required
                />
              </div>
              <div className="field full">
                <label>Profile Picture (optional)</label>
                <label
                  className={`file-upload-box ${files.profilePicture ? "has-file" : ""}`}
                  htmlFor="profilePic"
                >
                  {files.profilePicture ? files.profilePicture.name : "Click to upload"}
                </label>
                <input
                  id="profilePic"
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFile}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="section-label">Address / Location</div>
            <div className="form-grid">
              <div className="field full">
                <label>Full Address</label>
                <input name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>City</label>
                <input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>Area / Sector</label>
                <input name="area" placeholder="e.g. G-11, Bahria Town" value={form.area} onChange={handleChange} />
              </div>
              <div className="field full">
                <button type="button" className="btn btn-secondary" onClick={detectLocation} disabled={locating}>
                  <MapPin size={15} />
                  {locating ? "Location detect ho rahi hai..." : coords ? "Location set ho gayi ✓" : "Map par apni location set karein"}
                </button>
                <span className="field-hint">
                  Ye search/map par aapki listing sahi jagah dikhane ke liye zaroori hai — jitna qareeb, utna pehle aap
                  buyers ko dikhein ge.
                </span>
              </div>
            </div>

            {isSellerOrShop && (
              <>
                <div className="section-label">
                  {form.role === "shop" ? "Shop Details" : "Service Details"}
                </div>
                <div className="form-grid">
                  <div className="field full">
                    <label>{form.role === "shop" ? "Shop Name" : "Business / Service Name"}</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} required />
                  </div>
                  <div className="field full">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Category chunein</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="section-label">Payment / Bank Details (payout ke liye)</div>
                <div className="form-grid">
                  <div className="field">
                    <label>Account Title</label>
                    <input name="bankAccountTitle" value={form.bankAccountTitle} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Bank Name</label>
                    <input name="bankName" value={form.bankName} onChange={handleChange} />
                  </div>
                  <div className="field full">
                    <label>Account / IBAN Number</label>
                    <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} />
                  </div>
                </div>
              </>
            )}

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? "Register ho raha hai..." : "Register Karein"}
            </button>
          </form>

          <div className="auth-switch">
            Pehle se account hai? <Link to="/login">Login karein</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
