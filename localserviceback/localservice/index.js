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


app.listen(5000, () => {
  console.log("Server running on port 5000");
});