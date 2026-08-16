import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, User, Mail, Phone, Lock, ShoppingBag, Wrench, Store, Users } from "lucide-react";
import api from "../api/client";
import { fetchCategories } from "../api/listings";
import { fetchBanks } from "../api/admin.js";
import ReCaptcha from "../components/ReCaptcha.jsx";
import PasswordStrength, { evaluatePassword } from "../components/PasswordStrength.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { categoryLabel } from "../utils/categoryLabel.js";

const initialState = {
  role: "",
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
  const { t } = useLanguage();

  const ROLES = [
    { key: "buyer", label: t("auth.role.buyer"), Icon: ShoppingBag, desc: t("auth.role.buyerDesc") },
    { key: "seller", label: t("auth.role.seller"), Icon: Wrench, desc: t("auth.role.sellerDesc") },
    { key: "shop", label: t("auth.role.shop"), Icon: Store, desc: t("auth.role.shopDesc") },
  ];

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
  const [otpMethod, setOtpMethod] = useState(null);
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
      setError(t("auth.register.errLocationUnsupported"));
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
        setError(t("auth.register.errLocationDenied"));
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

    if (!form.role) {
      setError(t("auth.register.errRole"));
      return;
    }

    if (!otpMethod) {
      setError(t("auth.register.errOtpMethod"));
      return;
    }

    if (!evaluatePassword(form.password).isStrong) {
      setError(t("auth.password.strengthError"));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t("auth.password.mismatchError"));
      return;
    }

    if (isSellerOrShop) {
      if (!termsAccepted) {
        setError(t("auth.register.errTerms"));
        return;
      }
      if (!files.idCardFrontImage || !files.idCardBackImage || !files.idCardSelfieImage) {
        setError(t("auth.register.errIdDocs"));
        return;
      }
      if (form.category === "other" && !form.customCategoryName.trim()) {
        setError(t("auth.register.errCustomCategory"));
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
      setError(err.response?.data?.message || t("auth.register.errDefault"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-side">
        <h2>{t("auth.register.sideTitle")}</h2>
        <p>{t("auth.register.sideText")}</p>
        <ul className="auth-side-features">
          <li>✓ {t("auth.register.feature1")}</li>
          <li>✓ {t("auth.register.feature2")}</li>
          <li>✓ {t("auth.register.feature3")}</li>
        </ul>
      </div>

      <div className="auth-form-col">
        <div className="auth-card">
          <h1>{t("auth.register.title")}</h1>
          <p className="subtitle">{t("auth.register.subtitle")}</p>

          {error && <div className="alert alert-error">{error}</div>}

          {!form.role ? (
            <div className="role-choice-grid">
              {ROLES.map(({ key, label, Icon, desc }) => (
                <div key={key} className="role-choice-card" onClick={() => handleRoleChange(key)}>
                  <div className="role-choice-icon">
                    <Icon size={26} />
                  </div>
                  <div className="role-choice-label">{label}</div>
                  <div className="role-choice-desc">{desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="chosen-pill">
                {(() => {
                  const r = ROLES.find((x) => x.key === form.role);
                  const Icon = r.Icon;
                  return (
                    <>
                      <Icon size={16} />
                      <span>{r.label}</span>
                    </>
                  );
                })()}
                <button type="button" className="chosen-pill-change" onClick={() => handleRoleChange("")}>
                  {t("common.change")}
                </button>
              </div>

              {!otpMethod ? (
                <div className="field register-via-field">
                  <label>{t("auth.register.registerWithLabel")}</label>
                  <div className="otp-method-choice">
                    <button
                      type="button"
                      className="otp-method-option"
                      onClick={() => setOtpMethod("email")}
                    >
                      <Mail size={20} />
                      {t("common.email")}
                      <span className="otp-method-sub">{t("auth.register.codeToEmail")}</span>
                    </button>
                    <button
                      type="button"
                      className="otp-method-option"
                      onClick={() => setOtpMethod("sms")}
                    >
                      <Phone size={20} />
                      {t("common.mobileNumber")}
                      <span className="otp-method-sub">{t("auth.register.codeToSms")}</span>
                    </button>
                  </div>
                  <span className="field-hint">{t("auth.register.otpMethodHint")}</span>
                </div>
              ) : (
                <div className="chosen-pill">
                  {otpMethod === "email" ? <Mail size={16} /> : <Phone size={16} />}
                  <span>
                    {t("auth.register.registerWithPrefix")} {otpMethod === "email" ? t("common.email") : t("common.mobileNumber")}
                  </span>
                  <button type="button" className="chosen-pill-change" onClick={() => setOtpMethod(null)}>
                    {t("common.change")}
                  </button>
                </div>
              )}

          <form onSubmit={handleSubmit}>
            <div className="section-label">{t("auth.register.sectionBasic")}</div>
            <div className="form-grid">
              <div className="field">
                <label>{t("auth.firstName")}</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input name="firstName" value={form.firstName} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>{t("auth.lastName")}</label>
                <div className="input-icon-wrap">
                  <User size={16} className="input-icon" />
                  <input name="lastName" value={form.lastName} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>{t("auth.genderLabel")}</label>
                <div className="input-icon-wrap">
                  <Users size={16} className="input-icon" />
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">{t("auth.selectGender")}</option>
                    <option value="male">{t("auth.genderMale")}</option>
                    <option value="female">{t("auth.genderFemale")}</option>
                    <option value="other">{t("auth.genderOther")}</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{t("common.email")} {otpMethod === "email" && <span className="req-badge">{t("auth.register.codeSentHereBadge")}</span>}</label>
                <div className="input-icon-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
              </div>
              <div className="field">
                <label>
                  {t("auth.phoneNumberLabel")} {otpMethod === "sms" && <span className="req-badge">{t("auth.register.codeSentHereBadge")}</span>}
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
                <label>{t("auth.passwordLabel")}</label>
                <div className="input-icon-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                </div>
                <PasswordStrength password={form.password} />
              </div>
              <div className="field">
                <label>{t("auth.confirmPasswordLabel")}</label>
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
                <label>{t("auth.profilePictureLabel")} {!isSellerOrShop && t("common.optional")}</label>
                <label className={`file-upload-box ${files.profilePicture ? "has-file" : ""}`} htmlFor="profilePic">
                  {files.profilePicture ? files.profilePicture.name : t("common.clickToUpload")}
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

            <div className="section-label">{t("auth.register.sectionAddress")}</div>
            <div className="form-grid">
              <div className="field full">
                <label>{t("auth.fullAddress")}</label>
                <input name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>{t("search.city")}</label>
                <input name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="field">
                <label>{t("auth.areaSector")}</label>
                <input name="area" placeholder={t("auth.areaSectorPlaceholder")} value={form.area} onChange={handleChange} />
              </div>
              <div className="field full">
                <button type="button" className="btn btn-secondary" onClick={detectLocation} disabled={locating}>
                  <MapPin size={15} />
                  {locating ? t("auth.detectingLocation") : coords ? t("auth.locationSet") : t("auth.setLocationBtn")}
                </button>
                <span className="field-hint">{t("auth.register.locationHint")}</span>
              </div>
            </div>

            {isSellerOrShop && (
              <>
                <div className="section-label">{form.role === "shop" ? t("auth.register.sectionShopDetails") : t("auth.register.sectionServiceDetails")}</div>
                <div className="form-grid">
                  <div className="field full">
                    <label>{form.role === "shop" ? t("auth.shopNameLabel") : t("auth.businessNameLabel")}</label>
                    <input name="businessName" value={form.businessName} onChange={handleChange} required />
                  </div>
                  <div className="field full">
                    <label>{t("search.category")}</label>
                    <select name="category" value={form.category} onChange={handleChange} required>
                      <option value="">{t("auth.selectCategory")}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {categoryLabel(c, t)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {form.category === "other" && (
                    <div className="field full">
                      <label>{t("auth.customCategoryLabel")}</label>
                      <input
                        name="customCategoryName"
                        placeholder={t("auth.customCategoryPlaceholder")}
                        value={form.customCategoryName}
                        onChange={handleChange}
                        required
                      />
                      <span className="field-hint">{t("auth.customCategoryHint")}</span>
                    </div>
                  )}
                  <div className="field full">
                    <label>{t("auth.cnicLabel")}</label>
                    <input
                      name="cnicNumber"
                      placeholder="XXXXX-XXXXXXX-X"
                      value={form.cnicNumber}
                      onChange={handleChange}
                      required
                    />
                    <span className="field-hint">{t("auth.cnicHint")}</span>
                  </div>
                </div>

                <div className="section-label">{t("auth.register.sectionPayout")}</div>
                <div className="form-grid">
                  <div className="field">
                    <label>{t("auth.accountTitleLabel")}</label>
                    <input name="bankAccountTitle" value={form.bankAccountTitle} onChange={handleChange} />
                  </div>
                  <div className="field">
                    <label>{t("auth.bankWalletLabel")}</label>
                    <select name="bankName" value={form.bankName} onChange={handleChange}>
                      <option value="">{t("common.select")}</option>
                      {banks.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field full">
                    <label>{t("auth.ibanLabel")}</label>
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
                    {t("auth.register.tcPre")} <Link to="/terms" target="_blank">{t("footer.terms")}</Link> {t("auth.register.tcAnd")}{" "}
                    <Link to="/privacy" target="_blank">{t("footer.privacy")}</Link>{t("auth.register.tcPost")}
                  </label>
                </div>

                {termsAccepted && (
                  <>
                    <div className="section-label">{t("auth.register.sectionIdentity")}</div>
                    <div className="form-grid">
                      <div className="field">
                        <label>{t("auth.idCardFront")}</label>
                        <label className={`file-upload-box ${files.idCardFrontImage ? "has-file" : ""}`} htmlFor="idFront">
                          {files.idCardFrontImage ? files.idCardFrontImage.name : t("auth.clickToUploadImage")}
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
                        <label>{t("auth.idCardBack")}</label>
                        <label className={`file-upload-box ${files.idCardBackImage ? "has-file" : ""}`} htmlFor="idBack">
                          {files.idCardBackImage ? files.idCardBackImage.name : t("auth.clickToUploadImage")}
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
                        <label>{t("auth.selfieLabel")}</label>
                        <label
                          className={`file-upload-box ${files.idCardSelfieImage ? "has-file" : ""}`}
                          htmlFor="idSelfie"
                        >
                          {files.idCardSelfieImage ? files.idCardSelfieImage.name : t("auth.selfieUploadPrompt")}
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
                        <span className="field-hint">{t("auth.selfieHint")}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <ReCaptcha onChange={setRecaptchaToken} />

            <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: 10 }}>
              {loading ? t("auth.registering") : t("nav.register")}
            </button>
          </form>
            </>
          )}

          <div className="auth-switch">
            {t("auth.register.haveAccount")} <Link to="/login">{t("nav.login")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
