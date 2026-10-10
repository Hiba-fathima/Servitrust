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

    next();

  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }
};




app.get("/", (req, res) => {
  res.send("ServiTrust Backend Running");
});
app.post("/register", async (req, res) => {

  try {

    const { name, email, phone, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    await newUser.save();

    res.status(201).json({
      message: "Registration successful"
    });

  } catch (error) {

    res.status(500).json({
      message: "Registration failed",
      error: error.message
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
        message: "User not found"
      });
    }

    // Compare entered password with hashed password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      "servitrust_secret",
      {
        expiresIn: "1d"
      }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Login failed"
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

    console.log(
      "PROVIDER REQUEST:",
      req.body
    );


    const {
      userId,
      name,
      phone,
      category,
      services,
      location,
      experience,
      description,
      availability
    } = req.body;


    // ==========================================
    // VALIDATION
    // ==========================================

    const missingFields = [];


    if (!userId) {
      missingFields.push("userId");
    }


    if (!name) {
      missingFields.push("name");
    }


    if (!phone) {
      missingFields.push("phone");
    }


    if (
      !Array.isArray(category) ||
      category.length === 0
    ) {
      missingFields.push("category");
    }


    if (
      !Array.isArray(services) ||
      services.length === 0
    ) {
      missingFields.push("services");
    }


    if (!location) {
      missingFields.push("location");
    }


    if (!experience) {
      missingFields.push("experience");
    }


    if (!description) {
      missingFields.push("description");
    }


    if (missingFields.length > 0) {

      return res.status(400).json({

        message:
          "Please fill all required fields",

        missingFields

      });

    }


    // ==========================================
    // CHECK EXISTING PROVIDER
    // ==========================================

    const existingProvider =
      await Provider.findOne({
        userId
      });


    if (existingProvider) {

      return res.status(400).json({

        message:
          "Provider profile already exists"

      });

    }


    // ==========================================
    // CREATE PROVIDER
    // ==========================================

    const provider =
      new Provider({

        userId,

        category,

        services,

        location,

        experience,

        description,

        availability:
          availability || "Available",

        verificationStatus:
          "Pending",

        reliabilityScore:
          0,

        completedServices:
          0,

        cancelledServices:
          0,

        complaints:
          0,

        averageRating:
          0

      });


    await provider.save();


    // ==========================================
    // UPDATE USER NAME + PHONE
    // ==========================================

    await User.findByIdAndUpdate(

      userId,

      {
        name,
        phone
      }

    );


    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(201).json({

      message:
        "Provider profile created successfully",

      provider

    });


  } catch (error) {

    console.log(
      "CREATE PROVIDER ERROR:",
      error
    );


    res.status(500).json({

      message:
        "Failed to create provider profile",

      error:
        error.message

    });

  }

});











app.get("/providers", async (req, res) => {
  try {
    const providers = await Provider.find();

    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await User.findById(provider.userId)
          .select("name email phone");

        return {
          ...provider.toObject(),
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || ""
        };
      })
    );

    res.json(providersWithUser);

  } catch (error) {
    console.log("GET PROVIDERS ERROR:", error);

    res.status(500).json({
      message: "Failed to get providers",
      error: error.message
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
      providerName,
      serviceName,
      preferredDate,
      preferredTime,
      location,
      description,
      notes
    } = req.body;

   const missingFields = [];

if (!customerId) missingFields.push("customerId");
if (!providerId) missingFields.push("providerId");
if (!providerName) missingFields.push("providerName");
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

    const request = new ServiceRequest({
      customerId,
      providerId,
      providerName,
      serviceName,
      preferredDate,
      preferredTime,
      location,
      description,
      notes
    });

    await request.save();

    res.status(201).json({
      message: "Service request sent successfully",
      request
    });

  } catch (error) {
    console.log("CREATE SERVICE REQUEST ERROR:", error);

    res.status(500).json({
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



app.get("/categories", async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.json(categories);

  } catch (error) {
    console.log("GET CATEGORIES ERROR:", error);

    res.status(500).json({
      message: "Failed to get categories",
      error: error.message
    });
  }
});


app.post("/categories", async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const existingCategory = await Category.findOne({
      name: name.trim()
    });

    if (existingCategory) {
      return res.status(400).json({
        message: "Category already exists"
      });
    }

    const category = new Category({
      name: name.trim(),
      description: description.trim(),
      status: "Active"
    });

    await category.save();

    res.status(201).json({
      message: "Category added successfully",
      category
    });

  } catch (error) {
    console.log("ADD CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to add category",
      error: error.message
    });
  }
});

app.delete("/categories/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({
      message: "Category deleted successfully"
    });

  } catch (error) {
    console.log("DELETE CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to delete category",
      error: error.message
    });
  }
});

app.put("/categories/:id", async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: "Please fill all required fields"
      });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description.trim(),
        status: status || "Active"
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.json({
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    console.log("UPDATE CATEGORY ERROR:", error);

    res.status(500).json({
      message: "Failed to update category",
      error: error.message
    });
  }
});



// Update service request status
app.patch("/service-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "Pending",
      "Accepted",
      "In Progress",
      "Completed",
      "Cancelled",
    ];

    // Validate status
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    // Update status in MongoDB
    const request = await ServiceRequest.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!request) {
      return res.status(404).json({
        message: "Service request not found",
      });
    }

    res.status(200).json({
      message: "Status updated successfully",
      request,
    });
  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Failed to update status",
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







app.listen(5000, () => {
  console.log("Server running on port 5000");
});