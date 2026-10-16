const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const User = require("./models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Service = require("./models/ServiceModel");
const Provider = require("./models/ProviderModel");
const ServiceRequest = require("./models/RequestModel");
const Category = require("./models/CategoryModel");
const Complaint = require("./models/ComplaintModel");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const Notification = require("./models/NotificationModel");

const app = express();

app.use(cors());
app.use(express.json());

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("MongoDB connected");
//   })
//   .catch((error) => {
//     console.log(error);
//   });

  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log(err));

  // const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "No token provided"
    });
  }

  try {

    const decoded = jwt.verify(
      token,
      "servitrust_secret"
    );

req.userId = decoded.id;
req.userRole = decoded.role;    

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }
};






// CREATE NOTIFICATION
const createNotification = async ({
  recipientId = null,
  recipientRole,
  title,
  message,
  type,
  relatedId = "",
}) => {
  try {
    const notification = new Notification({
      recipientId,
      recipientRole,
      title,
      message,
      type,
      relatedId,
    });

    await notification.save();

    return notification;
  } catch (error) {
    console.error(
      "Notification creation failed:",
      error.message
    );

    return null;
  }
};






app.get("/", (req, res) => {
  res.send("ServiTrust Backend Running");
});



app.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password and role are required",
      });
    }

    if (!["customer", "provider", "admin"].includes(role)) {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      phone: phone || "",
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Create the provider record immediately after registration.
    if (role === "provider") {
      let provider;

      try {
        provider = new Provider({
          userId: newUser._id,
          category: [],
          services: [],
          location: "",
          experience: "",
          description: "",
          availability: "Available",
          verificationStatus: "Pending",
          reliabilityScore: 0,
          completedServices: 0,
          cancelledServices: 0,
          complaints: 0,
          averageRating: 0,
        });

        // The initial provider profile is intentionally incomplete.
        await provider.save({
          validateBeforeSave: false,
        });
      } catch (providerError) {
        // Avoid leaving a registered provider user without a provider record.
        await User.findByIdAndDelete(newUser._id);
        throw providerError;
      }

      await createNotification({
        recipientRole: "admin",
        title: "New Provider Registration",
        message: `${newUser.name} has registered as a service provider. Their profile is awaiting completion and verification.`,
        type: "provider_registration",
        relatedId: provider._id.toString(),
      });
    }

    return res.status(201).json({
      message:
        role === "provider"
          ? "Registration successful. Please complete your provider profile."
          : "Registration successful",

      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});




app.post("/login", async (req, res) => {
try {
const { email, password } = req.body;

// Find user by email
const user = await User.findOne({ email });

if (!user) {
  return res.status(400).json({
    message: "User not found",
  });
}

// Compare entered password with hashed password
const passwordMatch = await bcrypt.compare(
  password,
  user.password
);

if (!passwordMatch) {
  return res.status(400).json({
    message: "Invalid password",
  });
}

// Check provider account status BEFORE generating JWT
if (user.role === "provider") {
  const provider = await Provider.findOne({
    userId: user._id,
  });

  if (provider && provider.accountStatus === "Suspended") {
    return res.status(403).json({
      message:
        "Your provider account is suspended. Please contact the administrator.",
    });
  }
}

// Create JWT token only if the account is allowed to log in
const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
  },
  "servitrust_secret",
  {
    expiresIn: "1d",
  }
);

return res.json({
  message: "Login successful",
  token: token,
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  },
});

} catch (error) {
console.error("LOGIN ERROR:", error);

return res.status(500).json({
  message: "Login failed",
});

}
});




app.get("/profile", verifyToken, async (req, res) => {

  try {

    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(user);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Failed to get profile"
    });

  }

});

app.put("/profile", verifyToken, async (req, res) => {

  try {

    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        email,
        phone
      },
      {
        new: true
      }
    ).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Profile update failed"
    });

  }

});





// ADD SERVICE
app.post("/services", async (req, res) => {

  try {

    const {
      name,
      category,
      description,
      subServices,
      price,
      pricingType,
      duration,
      serviceArea,
      availability,
      emergencyService,
      serviceGuarantee,
      status
    } = req.body;


    const existingService = await Service.findOne({
      name: name
    });

    if (existingService) {

      return res.status(400).json({
        message: "Service already exists"
      });

    }


    const service = new Service({

      name,
      category,
      description,
      subServices: subServices || [],
      price,
      pricingType,
      duration,
      serviceArea,
      availability: availability || "Available",
      emergencyService: emergencyService || "No",
      serviceGuarantee: serviceGuarantee || "No Warranty",
      status: status || "Active"

    });


    await service.save();


    res.status(201).json({

      message: "Service added successfully",

      service: service

    });


  } catch (error) {

    console.log("POST SERVICE ERROR:", error);

    res.status(500).json({

      message: "Failed to add service",

      error: error.message

    });

  }

});




app.get("/services", async (req, res) => {
  try {
    const services = await Service.find();

    res.json(services);

  } catch (error) {
    console.log("GET SERVICE ERROR:", error);

    res.status(500).json({
      message: "Failed to get services",
      error: error.message
    });
  }
});




app.get("/services/:id", async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json(service);

  } catch (error) {
    console.log("GET SERVICE BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to get service",
      error: error.message
    });
  }
});




app.delete("/services/:id", async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);

    res.json({
      message: "Service deleted successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to delete service"
    });
  }
});



app.put("/services/:id", async (req, res) => {
  try {
    const updatedService =
      await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

    if (!updatedService) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json({
      message: "Service updated successfully",
      service: updatedService
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Failed to update service"
    });
  }
});






app.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    console.log("GET USERS ERROR:", error);

    res.status(500).json({
      message: "Failed to get users",
      error: error.message
    });
  }
});


app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully"
    });

  } catch (error) {
    console.log("DELETE USER ERROR:", error);

    res.status(500).json({
      message: "Failed to delete user",
      error: error.message
    });
  }
});







app.post("/providers", async (req, res) => {
  try {
    console.log("PROVIDER REQUEST:", req.body);

    const {
      userId,
      name,
      phone,
      category,
      services,
      location,
      experience,
      description,
      availability,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!userId || !name || !phone) {
      return res.status(400).json({
        message: "User ID, name and phone are required",
      });
    }

    // ==========================================
    // CHECK EXISTING PROVIDER
    // ==========================================

    let provider = await Provider.findOne({ userId });
    const isNewProvider = !provider;

    if (provider) {
      // UPDATE EXISTING PROVIDER PROFILE
      provider.category = Array.isArray(category) ? category : [];
      provider.services = Array.isArray(services) ? services : [];
      provider.location = location || "";
      provider.experience = experience || "";
      provider.description = description || "";
      provider.availability = availability || "Available";
    } else {
      // CREATE PROVIDER IF NO RECORD EXISTS
      provider = new Provider({
        userId,
        category: Array.isArray(category) ? category : [],
        services: Array.isArray(services) ? services : [],
        location: location || "",
        experience: experience || "",
        description: description || "",
        availability: availability || "Available",
        verificationStatus: "Pending",
        reliabilityScore: 0,
        completedServices: 0,
        cancelledServices: 0,
        complaints: 0,
        averageRating: 0,
      });
    }

    // Keep the existing verification status.
    if (!provider.verificationStatus) {
      provider.verificationStatus = "Pending";
    }

    await provider.save({ validateBeforeSave: false });

    // ==========================================
    // UPDATE USER NAME AND PHONE
    // ==========================================

    await User.findByIdAndUpdate(userId, {
      name,
      phone,
    });

    // ==========================================
    // NOTIFY ADMIN ONLY FOR NEW PROVIDERS
    // ==========================================

    if (isNewProvider) {
      await createNotification({
        recipientRole: "admin",
        title: "New Provider Registration",
        message: `${name} has registered as a service provider and is awaiting verification.`,
        type: "provider_registration",
        relatedId: provider._id.toString(),
      });
    }

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(isNewProvider ? 201 : 200).json({
      message: isNewProvider
        ? "Provider profile created successfully"
        : "Provider profile updated successfully",
      provider,
    });
  } catch (error) {
    console.error("CREATE/UPDATE PROVIDER ERROR:", error);

    res.status(500).json({
      message: "Failed to save provider profile",
      error: error.message,
    });
  }
});









app.get("/providers", async (req, res) => {
  try {
    const providers = await Provider.find().sort({
      _id: -1,
    });

    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await User.findById(provider.userId)
          .select("name email phone role");

        return {
          ...provider.toObject(),

          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",

          // Older provider records without a status remain visible as pending.
          verificationStatus:
            provider.verificationStatus || "Pending",
        };
      })
    );

    res.json(providersWithUser);
  } catch (error) {
    console.error("GET PROVIDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to get providers",
      error: error.message,
    });
  }
});














app.get("/providers/:id", async (req, res) => {

  try {

    const provider =
      await Provider.findById(req.params.id);


    if (!provider) {

      return res.status(404).json({
        message: "Provider not found"
      });

    }


    const user =
      await User.findById(provider.userId);


    res.json({

      ...provider.toObject(),

      name: user?.name || "",

      phone: user?.phone || "",

      email: user?.email || ""

    });


  } catch (error) {

    console.log(
      "GET PROVIDER ERROR:",
      error
    );

    res.status(500).json({

      message: "Failed to get provider",

      error: error.message

    });

  }

});








app.delete("/providers/:id", async (req, res) => {
  try {
    const deletedProvider = await Provider.findByIdAndDelete(
      req.params.id
    );

    if (!deletedProvider) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    res.json({
      message: "Provider deleted successfully"
    });

  } catch (error) {
    console.log("DELETE PROVIDER ERROR:", error);

    res.status(500).json({
      message: "Failed to delete provider"
    });
  }
});






app.put("/providers/:id/verification", async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    if (
      verificationStatus !== "Verified" &&
      verificationStatus !== "Rejected"
    ) {
      return res.status(400).json({
        message: "Invalid verification status"
      });
    }

    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: verificationStatus
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    res.json({
      message: `Provider ${verificationStatus.toLowerCase()} successfully`,
      provider
    });

  } catch (error) {
    console.log("VERIFICATION UPDATE ERROR:", error);

    res.status(500).json({
      message: "Failed to update provider verification",
      error: error.message
    });
  }
});


app.get(
  "/providers/service/:serviceName",
  async (req, res) => {

    try {

      const serviceName =
        decodeURIComponent(
          req.params.serviceName
        );

      const providers =
        await Provider.find({

          services: serviceName,

          verificationStatus:
            "Verified"

        });

      res.json(providers);

    } catch (error) {

      console.log(
        "GET VERIFIED PROVIDERS ERROR:",
        error
      );

      res.status(500).json({

        message:
          "Failed to get verified providers",

        error:
          error.message

      });

    }

  }
);








app.post("/service-requests", async (req, res) => {
  try {
    const {
      customerId,
      providerId,
      serviceName,
      preferredDate,
      preferredTime,
      location,
      description,
      notes
    } = req.body;

    // Validate required fields
    const missingFields = [];

    if (!customerId) missingFields.push("customerId");
    if (!providerId) missingFields.push("providerId");
    if (!serviceName) missingFields.push("serviceName");
    if (!preferredDate) missingFields.push("preferredDate");
    if (!preferredTime) missingFields.push("preferredTime");
    if (!location) missingFields.push("location");
    if (!description) missingFields.push("description");

    if (missingFields.length > 0) {
      return res.status(400).json({
        message: "Please fill all required fields",
        missingFields
      });
    }

    // Find the provider
    const provider = await Provider.findById(providerId);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found"
      });
    }

    // Get the provider's name from their User account
    const providerUser = await User.findById(provider.userId)
      .select("name");

    if (!providerUser || !providerUser.name?.trim()) {
      return res.status(400).json({
        message: "Provider account name not found"
      });
    }

    // Create the service request using the database name
    const request = new ServiceRequest({
      customerId,
      providerId,
      providerName: providerUser.name.trim(),
      serviceName,
      preferredDate,
      preferredTime,
      location,
      description,
      notes
    });

    await request.save();

    // Notify the provider
    await createNotification({
      recipientId: provider.userId,
      recipientRole: "provider",
      title: "New Service Request",
      message: `You have received a new ${serviceName} service request.`,
      type: "new_service_request",
      relatedId: request._id.toString()
    });

    return res.status(201).json({
      message: "Service request sent successfully",
      request
    });

  } catch (error) {
    console.error("CREATE SERVICE REQUEST ERROR:", error);

    return res.status(500).json({
      message: "Failed to create service request",
      error: error.message
    });
  }
});



app.get("/service-requests", async (req, res) => {
  try {
    const requests = await ServiceRequest
      .find()
      .sort({ createdAt: -1 });

    const requestsWithCustomer = await Promise.all(
      requests.map(async (request) => {
        const customer = await User.findById(
          request.customerId
        ).select("name email phone");

        return {
          ...request.toObject(),

          customerName: customer?.name || "Unknown Customer",
          customerEmail: customer?.email || "",
          customerPhone: customer?.phone || ""
        };
      })
    );

    res.json(requestsWithCustomer);

  } catch (error) {
    console.log("GET SERVICE REQUESTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get service requests",
      error: error.message
    });
  }
});



app.post("/admin/providers", async (req, res) => {

  try {

    const {
      name,
      email,
      phone,
      password,
      category,
      services,
      location,
      experience,
      description,
      availability
    } = req.body;


    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !category ||
      !services ||
      services.length === 0 ||
      !location ||
      !experience ||
      !description
    ) {

      return res.status(400).json({

        message:
          "Please fill all required provider fields"

      });

    }


    const existingUser =
      await User.findOne({ email });


    if (existingUser) {

      return res.status(400).json({

        message:
          "A user with this email already exists"

      });

    }


    const hashedPassword =
      await bcrypt.hash(password, 10);


    const user = new User({

      name,

      email,

      phone,

      password: hashedPassword,

      role: "provider"

    });


    await user.save();
    console.log("USER CREATED:", user._id);
console.log("USER NAME:", user.name);
console.log("USER EMAIL:", user.email);


    const provider = new Provider({

      userId: user._id,

      category,

      services,

      location,

      experience,

      description,

      availability,

      verificationStatus: "Verified",

      reliabilityScore: 0,

      completedServices: 0,

      cancelledServices: 0,

      complaints: 0,

      averageRating: 0

    });


    await provider.save();
console.log("PROVIDER USER ID:", provider.userId);

    res.status(201).json({

      message:
        "Provider created successfully",

      provider: {

        ...provider.toObject(),

        name,

        phone,

        email

      }

    });


  } catch (error) {

    console.log(
      "ADMIN PROVIDER ERROR:",
      error
    );

    res.status(500).json({

      message:
        "Failed to create provider",

      error: error.message

    });

  }

});





// SUSPEND OR ACTIVATE PROVIDER
app.patch("/admin/providers/:id/account-status", async (req, res) => {
  try {
    const { accountStatus, suspensionReason } = req.body;

    if (!["Active", "Suspended"].includes(accountStatus)) {
      return res.status(400).json({
        message: "Invalid account status",
      });
    }

    const provider = await Provider.findById(req.params.id);

    if (!provider) {
      return res.status(404).json({
        message: "Provider not found",
      });
    }

    provider.accountStatus = accountStatus;
    provider.suspensionReason =
      accountStatus === "Suspended"
        ? (suspensionReason || "").trim()
        : "";

    provider.suspendedAt =
      accountStatus === "Suspended" ? new Date() : null;

    await provider.save();

    const user = await User.findById(provider.userId).select(
      "name email phone"
    );

    res.json({
      message: `Provider ${accountStatus.toLowerCase()} successfully`,
      provider: {
        ...provider.toObject(),
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
      },
    });
  } catch (error) {
    console.error("PROVIDER ACCOUNT STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update provider account status",
      error: error.message,
    });
  }
});



app.get("/service-requests/provider/:providerId", async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      providerId: req.params.providerId
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      requests.map(async (request) => {

        const customer = await User.findById(
          request.customerId
        ).select("name email phone");

        return {
          ...request.toObject(),
          customerName: customer?.name || "Customer",
          customerEmail: customer?.email || "",
          customerPhone: customer?.phone || ""
        };
      })
    );

    res.json(result);

  } catch (error) {
    console.log("GET PROVIDER REQUESTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get provider requests"
    });
  }
});


app.put("/service-requests/:id/status", async (req, res) => {
  try {
    const { status, providerId } = req.body;

    if (!["Accepted", "Rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid request status"
      });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Service request not found"
      });
    }

    // Check that this request belongs to this provider
    if (
      providerId &&
      String(request.providerId) !== String(providerId)
    ) {
      return res.status(403).json({
        message: "You cannot update this request"
      });
    }

    // Only pending requests can be accepted/rejected
    if (request.status !== "Pending") {
      return res.status(400).json({
        message: "This request has already been processed"
      });
    }

    request.status = status;

    await request.save();

    res.json({
      message: `Request ${status} successfully`,
      request
    });

  } catch (error) {
    console.log("UPDATE REQUEST STATUS ERROR:", error);

    res.status(500).json({
      message: "Failed to update request status"
    });
  }
});



app.get("/service-requests/customer/:customerId", async (req, res) => {
  try {
    const requests = await ServiceRequest.find({
      customerId: req.params.customerId
    }).sort({ createdAt: -1 });

    res.json(requests);

  } catch (error) {
    console.log("GET CUSTOMER REQUESTS ERROR:", error);

    res.status(500).json({
      message: "Failed to get customer requests"
    });
  }
});





app.get("/providers/user/:userId", async (req, res) => {
  try {
    const provider = await Provider.findOne({
      userId: req.params.userId
    });

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    const user = await User.findById(
      req.params.userId
    ).select("name email phone role");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const providerData = {
      _id: provider._id,
      userId: provider.userId,

      // USER DETAILS
      name: user.name,
      email: user.email,
      phone: user.phone,

      // PROVIDER DETAILS
      category: provider.category,
      services: provider.services,
      location: provider.location,
      experience: provider.experience,
      description: provider.description,
      availability: provider.availability,

      verificationStatus:
        provider.verificationStatus,

      reliabilityScore:
        provider.reliabilityScore,

      completedServices:
        provider.completedServices,

      cancelledServices:
        provider.cancelledServices,

      complaints:
        provider.complaints,

      averageRating:
        provider.averageRating
    };

    res.json(providerData);

  } catch (error) {

    console.log(
      "GET PROVIDER PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch provider profile"
    });
  }
});





app.put("/providers/:id", async (req, res) => {
  try {
    const {
      name,
      phone,
      category,
      services,
      experience,
      location,
      description,
      availability
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Name is required"
      });
    }

    if (!phone) {
      return res.status(400).json({
        message: "Phone is required"
      });
    }

    if (!Array.isArray(category) || category.length === 0) {
      return res.status(400).json({
        message: "Please select at least one category"
      });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        message: "Please select at least one service"
      });
    }

    if (!experience) {
      return res.status(400).json({
        message: "Experience is required"
      });
    }

    if (!location) {
      return res.status(400).json({
        message: "Location is required"
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Description is required"
      });
    }

    const provider = await Provider.findById(
      req.params.id
    );

    if (!provider) {
      return res.status(404).json({
        message: "Provider profile not found"
      });
    }

    provider.category = category;
    provider.services = services;
    provider.experience = experience;
    provider.location = location;
    provider.description = description;
    provider.availability =
      availability || "Available";

    await provider.save();

    await User.findByIdAndUpdate(
      provider.userId,
      {
        name,
        phone
      }
    );

    const user = await User.findById(
      provider.userId
    ).select(
      "name email phone role"
    );

    const updatedProvider = {
      ...provider.toObject(),
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || ""
    };

    res.json({
      message: "Provider profile updated successfully",
      provider: updatedProvider
    });

  } catch (error) {
    console.log(
      "UPDATE PROVIDER PROFILE ERROR:",
      error
    );

    res.status(500).json({
      message: "Failed to update provider profile"
    });
  }
});







// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Keep uploaded image in memory before sending it to Cloudinary
const storage = multer.memoryStorage();

const uploadCategoryImage = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Maximum 5 MB
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      callback(null, true);
    } else {
      callback(new Error("Please upload a valid image."));
    }
  }
});

// Upload an image buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "servitrust/categories",
        resource_type: "image"
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      }
    );

    stream.end(buffer);
  });
};





// GET: Fetch all categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json(categories);
  } catch (error) {
    console.error("Fetch categories error:", error);

    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
});


// POST: Add a category with an optional image
app.post(
  "/categories",
  uploadCategoryImage.single("image"),
  async (req, res) => {
    try {
      const { name, description, status } = req.body;

      if (!name || !name.trim() || !description || !description.trim()) {
        return res.status(400).json({
          message: "Category name and description are required"
        });
      }

      const existingCategory = await Category.findOne({
        name: name.trim()
      });

      if (existingCategory) {
        return res.status(400).json({
          message: "This category already exists"
        });
      }

      let image = "";
      let imagePublicId = "";

      // Image is optional
      if (req.file) {
        const uploadedImage = await uploadToCloudinary(req.file.buffer);

        image = uploadedImage.secure_url;
        imagePublicId = uploadedImage.public_id;
      }

      const category = await Category.create({
        name: name.trim(),
        description: description.trim(),
        status: status || "Active",
        image,
        imagePublicId
      });

      res.status(201).json({
        message: "Category added successfully",
        category
      });
    } catch (error) {
      console.error("Add category error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "This category already exists"
        });
      }

      res.status(500).json({
        message: "Failed to add category"
      });
    }
  }
);


// PUT: Update a category and optionally replace/remove its image
app.put(
  "/categories/:id",
  uploadCategoryImage.single("image"),
  async (req, res) => {
    try {
      const { name, description, status, removeImage } = req.body;

      const category = await Category.findById(req.params.id);

      if (!category) {
        return res.status(404).json({
          message: "Category not found"
        });
      }

      if (name !== undefined && !name.trim()) {
        return res.status(400).json({
          message: "Category name is required"
        });
      }

      if (description !== undefined && !description.trim()) {
        return res.status(400).json({
          message: "Category description is required"
        });
      }

      // Check whether another category already uses this name
      if (name !== undefined && name.trim() !== category.name) {
        const duplicate = await Category.findOne({
          name: name.trim(),
          _id: { $ne: category._id }
        });

        if (duplicate) {
          return res.status(400).json({
            message: "This category name already exists"
          });
        }
      }

      // Replace the existing image when a new one is uploaded
      if (req.file) {
        const uploadedImage = await uploadToCloudinary(req.file.buffer);

        // Delete the previous Cloudinary image after successful upload
        if (category.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(category.imagePublicId);
          } catch (imageError) {
            console.error("Old image deletion error:", imageError);
          }
        }

        category.image = uploadedImage.secure_url;
        category.imagePublicId = uploadedImage.public_id;
      } else if (removeImage === "true") {
        // Remove the existing image when requested
        if (category.imagePublicId) {
          try {
            await cloudinary.uploader.destroy(category.imagePublicId);
          } catch (imageError) {
            console.error("Image deletion error:", imageError);
          }
        }

        category.image = "";
        category.imagePublicId = "";
      }

      // Update the remaining fields
      if (name !== undefined) category.name = name.trim();

      if (description !== undefined) {
        category.description = description.trim();
      }

      if (status !== undefined) category.status = status;

      await category.save();

      res.status(200).json({
        message: "Category updated successfully",
        category
      });
    } catch (error) {
      console.error("Update category error:", error);

      if (error.code === 11000) {
        return res.status(400).json({
          message: "This category name already exists"
        });
      }

      res.status(500).json({
        message: "Failed to update category"
      });
    }
  }
);


// DELETE: Delete a category and its Cloudinary image
app.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    if (category.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(category.imagePublicId);
      } catch (imageError) {
        console.error("Cloudinary image deletion error:", imageError);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      message: "Failed to delete category"
    });
  }
});








// UPDATE SERVICE REQUEST STATUS AND NOTIFY CUSTOMER
app.patch(
  "/service-requests/:id/status",
  verifyToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "Pending",
        "Accepted",
        "Rejected",
        "In Progress",
        "Completed",
        "Cancelled",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      const request = await ServiceRequest.findById(id);

      if (!request) {
        return res.status(404).json({
          message: "Service request not found",
        });
      }

      // Allow only appropriate status transitions.
      const previousStatus = request.status;

      const allowedTransitions = {
        Pending: ["Accepted", "Rejected", "Cancelled"],
        Accepted: ["In Progress", "Completed", "Cancelled"],
        "In Progress": ["Completed", "Cancelled"],
      };

      if (
        !allowedTransitions[previousStatus] ||
        !allowedTransitions[previousStatus].includes(status)
      ) {
        return res.status(400).json({
          message: `Cannot change request status from ${previousStatus} to ${status}`,
        });
      }

      // Verify who is making the update.
      if (req.userRole === "provider") {
        const provider = await Provider.findOne({
          userId: req.userId,
        });

        if (
          !provider ||
          String(request.providerId) !== String(provider._id)
        ) {
          return res.status(403).json({
            message: "You cannot update this request",
          });
        }
      } else if (req.userRole === "customer") {
        if (
          String(request.customerId) !== String(req.userId) ||
          status !== "Cancelled"
        ) {
          return res.status(403).json({
            message: "You cannot perform this action",
          });
        }
      } else if (req.userRole !== "admin") {
        return res.status(403).json({
          message: "You are not authorized to update this request",
        });
      }

      request.status = status;
      await request.save();

      // Notify the customer about meaningful status changes.
      const messages = {
        Accepted: {
          title: "Request Accepted",
          message: `Your ${request.serviceName} service request has been accepted.`,
          type: "request_accepted",
        },
        Rejected: {
          title: "Request Rejected",
          message: `Your ${request.serviceName} service request has been rejected.`,
          type: "request_rejected",
        },
        "In Progress": {
          title: "Service In Progress",
          message: `Work on your ${request.serviceName} service request is now in progress.`,
          type: "request_in_progress",
        },
        Completed: {
          title: "Service Completed",
          message: `Your ${request.serviceName} service request has been marked as completed.`,
          type: "request_completed",
        },
        Cancelled: {
          title: "Request Cancelled",
          message: `Your ${request.serviceName} service request has been cancelled.`,
          type: "request_cancelled",
        },
      };

      const notificationData = messages[status];

      if (notificationData) {
        await createNotification({
          recipientId: request.customerId,
          recipientRole: "customer",
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          relatedId: request._id.toString(),
        });
      }

      return res.json({
        message: `Request status updated to ${status}`,
        request,
      });
    } catch (error) {
      console.error("UPDATE REQUEST STATUS ERROR:", error);

      return res.status(500).json({
        message: "Failed to update request status",
      });
    }
  }
);





// GET ALL COMPLAINTS
app.get("/complaints", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({
      createdAt: -1,
    });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Fetch complaints error:", error);

    res.status(500).json({
      message: "Failed to fetch complaints",
      error: error.message,
    });
  }
});


// const express = require("express");
// const mongoose = require("mongoose");
// const router = express.Router();

// const Complaint = require("../models/Complaint");

// GET ALL COMPLAINTS
// Optional filters: status, category, search





// router.get("/", async (req, res) => {
// try {
// const { status, category, search } = req.query;
// const filter = {};

// if (status && status !== "All") {
//   filter.status = status;
// }

// if (category && category !== "All") {
//   filter.category = category;
// }

// if (search && search.trim()) {
//   const escapedSearch = search
//     .trim()
//     .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

//   const regex = new RegExp(escapedSearch, "i");

//   filter.$or = [
//     { complaintId: regex },
//     { subject: regex },
//     { description: regex },
//     { category: regex },
//   ];
// }

// const complaints = await Complaint.find(filter)
//   .populate("customer", "name email phone")
//   .populate("provider", "name email phone")
//   .sort({ createdAt: -1 });

// res.status(200).json(complaints);

// } catch (error) {
// console.error("Fetch complaints error:", error);
// res.status(500).json({
// message: "Failed to fetch complaints",
// });
// }
// });

// // GET ONE COMPLAINT
// router.get("/:id", async (req, res) => {
// try {
// if (!mongoose.isValidObjectId(req.params.id)) {
// return res.status(400).json({
// message: "Invalid complaint ID",
// });
// }

// const complaint = await Complaint.findById(req.params.id)
//   .populate("customer", "name email phone")
//   .populate("provider", "name email phone");

// if (!complaint) {
//   return res.status(404).json({
//     message: "Complaint not found",
//   });
// }

// res.status(200).json(complaint);

// } catch (error) {
// console.error("Fetch complaint error:", error);
// res.status(500).json({
// message: "Failed to fetch complaint",
// });
// }
// });

// // CREATE COMPLAINT
// router.post("/", async (req, res) => {
// try {
// const {
// customer,
// provider,
// bookingId,
// category,
// subject,
// description,
// } = req.body;

// if (!customer || !category || !subject || !description) {
//   return res.status(400).json({
//     message: "Customer, category, subject, and description are required",
//   });
// }

// if (!mongoose.isValidObjectId(customer)) {
//   return res.status(400).json({
//     message: "Invalid customer ID",
//   });
// }

// if (provider && !mongoose.isValidObjectId(provider)) {
//   return res.status(400).json({
//     message: "Invalid provider ID",
//   });
// }

// if (bookingId && !mongoose.isValidObjectId(bookingId)) {
//   return res.status(400).json({
//     message: "Invalid booking ID",
//   });
// }

// const complaint = await Complaint.create({
//   customer,
//   provider: provider || null,
//   bookingId: bookingId || null,
//   category,
//   subject,
//   description,
// });

// const result = await Complaint.findById(complaint._id)
//   .populate("customer", "name email phone")
//   .populate("provider", "name email phone");

// res.status(201).json({
//   message: "Complaint submitted successfully",
//   complaint: result,
// });

// } catch (error) {
// console.error("Create complaint error:", error);

// if (error.name === "ValidationError") {
//   return res.status(400).json({
//     message: error.message,
//   });
// }

// res.status(500).json({
//   message: "Failed to submit complaint",
// });


// }
// });

// // UPDATE COMPLAINT
// router.put("/:id", async (req, res) => {
// try {
// if (!mongoose.isValidObjectId(req.params.id)) {
// return res.status(400).json({
// message: "Invalid complaint ID",
// });
// }

// const { status, adminNotes, resolution } = req.body;
// const allowedStatuses = [
//   "Pending",
//   "Under Review",
//   "Resolved",
//   "Closed",
// ];

// const updates = {};

// if (status !== undefined) {
//   if (!allowedStatuses.includes(status)) {
//     return res.status(400).json({
//       message: "Invalid complaint status",
//     });
//   }

//   updates.status = status;

//   if (status === "Resolved" || status === "Closed") {
//     updates.resolvedAt = new Date();
//   } else {
//     updates.resolvedAt = null;
//   }
// }

// if (adminNotes !== undefined) {
//   updates.adminNotes = adminNotes;
// }

// if (resolution !== undefined) {
//   updates.resolution = resolution;
// }

// if (Object.keys(updates).length === 0) {
//   return res.status(400).json({
//     message: "No updates provided",
//   });
// }

// const complaint = await Complaint.findByIdAndUpdate(
//   req.params.id,
//   { $set: updates },
//   {
//     new: true,
//     runValidators: true,
//   }
// )
//   .populate("customer", "name email phone")
//   .populate("provider", "name email phone");

// if (!complaint) {
//   return res.status(404).json({
//     message: "Complaint not found",
//   });
// }

// res.status(200).json({
//   message: "Complaint updated successfully",
//   complaint,
// });

// } catch (error) {
// console.error("Update complaint error:", error);
// res.status(500).json({
// message: "Failed to update complaint",
// });
// }
// });

// // DELETE COMPLAINT
// router.delete("/:id", async (req, res) => {
// try {
// if (!mongoose.isValidObjectId(req.params.id)) {
// return res.status(400).json({
// message: "Invalid complaint ID",
// });
// }

// const complaint = await Complaint.findByIdAndDelete(req.params.id);

// if (!complaint) {
//   return res.status(404).json({
//     message: "Complaint not found",
//   });
// }

// res.status(200).json({
//   message: "Complaint deleted successfully",
// });

// } catch (error) {
// console.error("Delete complaint error:", error);
// res.status(500).json({
// message: "Failed to delete complaint",
// });
// }
// });

// module.exports = router;




// const handleAccountStatusChange = (provider) => {
//   const currentStatus = provider.accountStatus || "Active";

//   if (currentStatus === "Suspended") {
//     activateProvider(provider);
//     return;
//   }

//   setSuspensionReason("");
//   setSuspendingProvider(provider);
// };

// const confirmSuspendProvider = async (event) => {
//   event.preventDefault();

//   if (!suspendingProvider) return;

//   if (!suspensionReason.trim()) {
//     Swal.fire("Required", "Please enter a suspension reason.", "warning");
//     return;
//   }

//   try {
//     setSavingSuspension(true);

//     const response = await axios.patch(
//       `https://servitrust-baxkend.onrender.com/admin/providers/${suspendingProvider._id}/account-status`,
//       {
//         accountStatus: "Suspended",
//         suspensionReason: suspensionReason.trim(),
//       },
//       {
//         headers: {
//           // Replace this key if your project stores the admin token
//           // under a different localStorage key.
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     setProviders((previousProviders) =>
//       previousProviders.map((provider) =>
//         provider._id === suspendingProvider._id
//           ? response.data.provider
//           : provider
//       )
//     );

//     setSuspendingProvider(null);
//     setSuspensionReason("");

//     Swal.fire("Suspended", "Provider account suspended.", "success");
//   } catch (error) {
//     console.error(error);

//     Swal.fire(
//       "Error",
//       error.response?.data?.message || "Could not suspend provider.",
//       "error"
//     );
//   } finally {
//     setSavingSuspension(false);
//   }
// };

// const activateProvider = async (provider) => {
//   const result = await Swal.fire({
//     title: "Activate provider?",
//     text: `Allow ${provider.name} to use their provider account again?`,
//     icon: "question",
//     showCancelButton: true,
//     confirmButtonText: "Yes, activate",
//     cancelButtonText: "Cancel",
//   });

//   if (!result.isConfirmed) return;

//   try {
//     const response = await axios.patch(
//       `https://servitrust-baxkend.onrender.com/admin/providers/${provider._id}/account-status`,
//       {
//         accountStatus: "Active",
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     setProviders((previousProviders) =>
//       previousProviders.map((item) =>
//         item._id === provider._id ? response.data.provider : item
//       )
//     );

//     Swal.fire("Activated", "Provider account activated.", "success");
//   } catch (error) {
//     console.error(error);

//     Swal.fire(
//       "Error",
//       error.response?.data?.message || "Could not activate provider.",
//       "error"
//     );
//   }
// };

// ADMIN SENDS PROFILE COMPLETION NOTIFICATION TO PROVIDER
app.post(
  "/notifications/provider-reminder",
  verifyToken,
  async (req, res) => {
    try {
      // Only admin can send provider reminders
      if (req.userRole !== "admin") {
        return res.status(403).json({
          message: "Only admin can send profile reminders",
        });
      }

      const { providerId, title, message } = req.body;

      if (!providerId || !title || !message) {
        return res.status(400).json({
          message: "Provider ID, title and message are required",
        });
      }

      const provider = await Provider.findById(providerId);

      if (!provider) {
        return res.status(404).json({
          message: "Provider not found",
        });
      }

      if (!provider.userId) {
        return res.status(400).json({
          message: "This provider is not linked to a user account",
        });
      }

      await createNotification({
        recipientId: provider.userId,
        recipientRole: "provider",
        title: title,
        message: message,
        type: "profile_completion",
        relatedId: provider._id.toString(),
      });

      return res.status(201).json({
        message: "Profile completion notification sent successfully",
      });
    } catch (error) {
      console.error("PROVIDER REMINDER ERROR:", error);

      return res.status(500).json({
        message: "Failed to send profile reminder",
      });
    }
  }
);


// GET NOTIFICATIONS
app.get("/notifications", verifyToken, async (req, res) => {
  try {
    const { userId, userRole } = req;

    if (!["admin", "customer", "provider"].includes(userRole)) {
      return res.status(403).json({
        message: "Invalid user role",
      });
    }

    let filter;

    if (userRole === "admin") {
      filter = {
        recipientRole: "admin",
        recipientId: null,
      };
    } else {
      filter = {
        recipientId: userId,
        recipientRole: userRole,
      };
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);

    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
});



// MARK ONE NOTIFICATION AS READ
app.patch(
  "/notifications/:id/read",
  verifyToken,
  async (req, res) => {
    try {
      const { userId, userRole } = req;

      if (!["admin", "customer", "provider"].includes(userRole)) {
        return res.status(403).json({
          message: "Invalid user role",
        });
      }

      let filter;

      if (userRole === "admin") {
        filter = {
          recipientRole: "admin",
          recipientId: null,
        };
      } else {
        filter = {
          recipientId: userId,
          recipientRole: userRole,
        };
      }

      const notification = await Notification.findOneAndUpdate(
        {
          _id: req.params.id,
          ...filter,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
        {
          new: true,
        }
      );

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      res.json({
        message: "Notification marked as read",
        notification,
      });
    } catch (error) {
      console.error("Mark notification read error:", error);

      res.status(500).json({
        message: "Failed to update notification",
      });
    }
  }
);





// MARK ALL NOTIFICATIONS AS READ
app.patch(
  "/notifications/read-all",
  verifyToken,
  async (req, res) => {
    try {
      const { userId, userRole } = req;

      if (!["admin", "customer", "provider"].includes(userRole)) {
        return res.status(403).json({
          message: "Invalid user role",
        });
      }

      let filter;

      if (userRole === "admin") {
        filter = {
          recipientRole: "admin",
          recipientId: null,
        };
      } else {
        filter = {
          recipientId: userId,
          recipientRole: userRole,
        };
      }

      await Notification.updateMany(
        {
          ...filter,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      res.json({
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Mark all notifications error:", error);

      res.status(500).json({
        message: "Failed to update notifications",
      });
    }
  }
);





app.listen(5000, () => {
  console.log("Server running on port 5000");
});