const mongoose = require("mongoose");
const { Schema } = mongoose;

const ManagerSchema = new Schema(
  {
    $ref: { type: String, default: null },
    displayName: { type: String, default: null },
    value: { type: String, default: null },
  },
  { _id: false },
);

const NameSchema = new Schema(
  {
    familyName: { type: String, default: null },
    givenName: { type: String, default: null },
    formatted: { type: String, default: null },
    honorificPrefix: { type: String, default: null },
    honorificSuffix: { type: String, default: null },
    middleName: { type: String, default: null },
  },
  { _id: false },
);

const AddressSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["work", "home", "other", null],
      default: null,
    },
    country: { type: String, default: null },
    formatted: { type: String, default: null },
    locality: { type: String, default: null },
    postalCode: { type: String, default: null },
    primary: { type: Boolean, default: null },
    region: { type: String, default: null },
    streetAddress: { type: String, default: null },
    displayName: { type: String, default: null },
  },
  { _id: false },
);

const EmailSchema = new Schema(
  {
    type: { type: String, default: null },
    value: { type: String, required: true },
    display: { type: String, default: null },
    primary: { type: Boolean, default: null },
  },
  { _id: false },
);

const GroupSchema = new Schema(
  {
    value: { type: String, required: true },
    $ref: { type: String, default: null },
  },
  { _id: false },
);

const ImSchema = new Schema(
  {
    type: { type: String, default: null },
    value: { type: String, required: true },
    display: { type: String, default: null },
    primary: { type: Boolean, default: null },
  },
  { _id: false },
);

const PhoneNumberSchema = new Schema(
  {
    type: { type: String, default: null },
    value: { type: String, required: true },
    display: { type: String, default: null },
    primary: { type: Boolean, default: null },
  },
  { _id: false },
);

const PhotoSchema = new Schema(
  {
    type: { type: String, enum: ["photo", "thumbnail", null], default: null },
    value: { type: String, required: true },
    primary: { type: Boolean, default: null },
  },
  { _id: false },
);

const EnterpriseExtensionSchema = new Schema(
  {
    costCenter: { type: String, default: null },
    department: { type: String, default: null },
    division: { type: String, default: null },
    employeeNumber: { type: String, default: null },
    manager: { type: ManagerSchema, default: null },
    organization: { type: String, default: null },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    id: { type: String, default: undefined },
    userName: { type: String, required: true },
    active: { type: Boolean, default: null },
    externalId: { type: String, default: null },
    schemas: [{ type: String, required: true }],
    addresses: { type: [AddressSchema], default: null },
    emails: { type: [EmailSchema], default: null },
    entitlements: { type: [Schema.Types.Mixed], default: null },
    groups: { type: [GroupSchema], default: null },
    ims: { type: [ImSchema], default: null },
    locale: { type: String, default: null },
    meta: { type: Schema.Types.Mixed, default: null },
    name: { type: NameSchema, default: null },
    nickName: { type: String, default: null },
    password: { type: String, default: null },
    phoneNumbers: { type: [PhoneNumberSchema], default: null },
    photos: { type: [PhotoSchema], default: null },
    preferredLanguage: { type: String, default: null },
    profileUrl: { type: String, default: null },
    roles: { type: [Schema.Types.Mixed], default: null },
    timezone: { type: String, default: null },
    title: { type: String, default: null },
    userType: { type: String, default: null },
    "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User": {
      type: EnterpriseExtensionSchema,
      default: null,
    },
  },
  { timestamps: true },
);

exports.UserSchema = mongoose.model("User", UserSchema, "airtable_users");
