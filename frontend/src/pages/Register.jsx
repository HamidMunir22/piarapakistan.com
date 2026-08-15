import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, User, Mail, Phone, Lock, ShoppingBag, Wrench, Store, Users } from "lucide-react";
import api from "../api/client";
import { fetchCategories } from "../api/listings";
import { fetchBanks } from "../api/admin.js";
import ReCaptcha from "../components/ReCaptcha.jsx";
import PasswordStrength, { evaluatePassword } from "../components/PasswordStrength.jsx";

const initialState = {
  role: "buyer",
  firstName: "",
  lastName: "",
  gender: "",
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
  customCategoryName: "",
  bankAccountTitle: "",
  bankAccountNumber: "",
  bankName: "",
};

const Register = () => {
  const [form, setForm] = useState(initialState);
  const [files, setFiles] = useState({
    idCardFrontImage: null,
    idCardBackImage: null,
    idCardSelfieImage: null,
    profilePicture: null,
  });
  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [coords, setCoords] = useState(null);
  const [locating, setLocating] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  // Which channel the verification code should be sent through. Email
  // defaults on since SMS delivery to Pakistani numbers depends on an SMS
  // gateway (Twilio etc.) being fully configured, which isn't always
  // reliable — letting the user pick avoids them waiting on a channel that
  // was never going to arrive.
  const [otpMethod, setOtpMethod] = useState("email");
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
    fetchBanks().then(setBanks).catch(() => {});
  }, []);

  const isSellerOrShop = form.role === "seller" || form.role === "shop";

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Your browser can't detect location");
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
        setError("Couldn't get your location. Please allow location access in your browser settings.");
      }
    );
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (r) => {
    // Reset terms acceptance when switching roles, since buyers never need
    // to see the ID/selfie step, and a role switch should re-confirm intent.
    setTermsAccepted(false);
    setForm({ ...form, role: r });
  };

  const handleFile = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!evaluatePassword(form.password).isStrong) {
      setError(
        "Please choose a stronger password — at least 8 characters with uppercase, lowercase, a number, and a special character (@#$%&*)."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    if (isSellerOrShop) {
      if (!termsAccepted) {
        setError("Please accept the Terms & Conditions to continue");
        return;
      }
      if (!files.idCardFrontImage || !files.idCardBackImage || !files.idCardSelfieImage) {
        setError("ID card (front + back) and a selfie holding your ID card are required for sellers/shops");
        return;
      }
      if (form.category === "other" && !form.customCategoryName.trim()) {
        setError("Please type your service/product category");
        return;
      }
    }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "confirmPassword") fd.append(key, value);
      });
      fd.append("termsAccepted", isSellerOrShop ? "true" : "false");
      fd.append("otpMethod", otpMethod);
      if (recaptchaToken) fd.append("recaptchaToken", recaptchaToken);
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

      navigate("/verify-otp", { state: { phone: res.data.phone, otpMethod } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>Bring your services or shop to millions of people.</h2>
        <p>
          Register on PiaraPakistan — buyer or seller — every account is verified so the platform stays safe for
          everyone.
        </p>
      </div>

      <div className="auth-form-col">
        <div className="auth-card">
          <h1>Create Account</h1>
          <p className="subtitle">Just 2 minutes — secure and simple</p>

          <div className="role-tabs">
            {[
              { key: "buyer", label: "Buyer", Icon: ShoppingBag },
              { key: "seller", label: "Service Seller", Icon: Wrench },
              { key: "shop", label: "Shop Owner", Icon: Store },
            ].map(({ key, label, Icon }) => (
              <div
                key={key}
                className={`role-tab ${form.role === key ? "active" : ""}`}
                onClick={() => handleRoleChange(key)}
              >
                <Icon size={20} className="role-tab-icon" />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="field register-via-field">
            <label>Register with</label>
            <div className="otp-method-choice">
              <button
                type="button"
                className={`otp-method-option ${otpMethod === "email" ? "active" : ""}`}
                onClick={() => setOtpMethod("email")}
              >
                <Mail size={20} />
                Email
                <span className="otp-method-sub">Code sent to your email</span>
              </button>
              <button
                type="button"
                className={`otp-method-option ${otpMethod === "sms" ? "active" : ""}`}
                onClick={() => setOtpMethod("sms")}
              >
                <Phone size={20} />
                Mobile Number
                <span className="otp-method-sub">Code sent via SMS to your SIM</span>
              </button>
            </div>
            <span className="field-hint">
              Both email and phone number are required either way — this only decides where your verification code
              is delivered.
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="section-label">Basic Information</div>
            <div className="form-grid">
              <div className="field">
                <label>First Name</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>Last Name</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>Gender</label>
                <div className="input-icon-wrap">
                  <Users size={16} className="input-icon" />
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Email {otpMethod === "email" && <span className="req-badge">code sent here</span>}</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>
                  Phone Number {otpMethod === "sms" && <span className="req-badge">code sent here</span>}
                </label>
                <div className="input-icon-wrap">
                  <Phone size={16} className="input-icon" />
                  <input
                    name="phone"
                    placeholder="+92 3XX XXXXXXX"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="field full">
                <label>Profile Picture {!isSellerOrShop && "(optional)"}</label>
                <label className={`file-upload-box ${files.profilePicture ? "has-file" : ""}`} htmlFor="profilePic">
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
                  {locating ? "Detecting location..." : coords ? "Location set ✓" : "Set your location on the map"}
                </button>
                <span className="field-hint">
                  This is used to show your listing on the map and in nearby search results — the closer you are,
                  the higher you appear for buyers.
                </span>
              </div>
            </div>

            {isSellerOrShop && (
              <>
                <div className="section-label">{form.role === "shop" ? "Shop Details" : "Service Details"}</div>
                <div className="form-grid">
                  <div className="field full">
                    <label>{form.role === "shop" ? "Shop Name" : "Business / Service Name"}</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} required />
                  </div>
                  <div className="field full">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="">Select a category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.category === "other" && (
                    <div className="field full">
                      <label>Your Category Name</label>
                      <input
                        name="customCategoryName"
                        placeholder="e.g. Pest Control, Event Decoration..."
                        value={form.customCategoryName}
                        onChange={handleChange}
                        required
                      />
                      <span className="field-hint">
                        Don't see your service/product above? Type it here instead.
                      </span>
                    </div>
                  )}
                  <div className="field full">
                    <label>CNIC Number</label>
                    <input
                      name="cnicNumber"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={form.cnicNumber}
                      onChange={handleChange}
                      required
                    />
                    <span className="field-hint">Required for seller/shop verification (fraud prevention).</span>
                  </div>
                </div>

                <div className="section-label">Payout Details</div>
                <div className="form-grid">
                  <div className="field">
                    <label>Account Title</label>
                    <input name="bankAccountTitle" value={form.bankAccountTitle} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>Bank / Wallet</label>
                    <select name="bankName" value={form.bankName} onChange={handleChange}>
                      <option value="">Select</option>
                      {banks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field full">
                    <label>Account / IBAN Number</label>
                    <input name="bankAccountNumber" value={form.bankAccountNumber} onChange={handleChange} />
                  </div>
                </div>

                <div className="tc-check">
                  <input
                    type="checkbox"
                    id="tcAccept"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="tcAccept">
                    I agree to the <Link to="/terms" target="_blank">Terms &amp; Conditions</Link> and{" "}
                    <Link to="/privacy" target="_blank">Privacy Policy</Link>, and I understand my account will be
                    reviewed (usually within 24 hours) before I can list services/products.
                  </label>
                </div>

                {termsAccepted && (
                  <>
                    <div className="section-label">Identity Verification</div>
                    <div className="form-grid">
                      <div className="field">
                        <label>ID Card - Front</label>
                        <label className={`file-upload-box ${files.idCardFrontImage ? "has-file" : ""}`} htmlFor="idFront">
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
                        <label>Selfie Holding Your ID Card</label>
                        <label
                          className={`file-upload-box ${files.idCardSelfieImage ? "has-file" : ""}`}
                          htmlFor="idSelfie"
                        >
                          {files.idCardSelfieImage ? files.idCardSelfieImage.name : "Click to upload — take a photo of yourself holding your ID card"}
                        </label>
                        <input
                          id="idSelfie"
                          type="file"
                          name="idCardSelfieImage"
                          accept="image/*"
                          onChange={handleFile}
                          style={{ display: "none" }}
                          required
                        />
                        <span className="field-hint">
                          Hold your ID card next to your face and take a clear selfie — this confirms it's really you.
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <ReCaptcha onChange={setRecaptchaToken} />

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
