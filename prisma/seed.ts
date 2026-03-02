// ? Custom uuid is used as IDs in creating transactions, which came from transactionOptions array

/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash("password", saltRounds);

  // Create superadmin
  const superadmin = await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "0",
      email: "superadmin@gscwd.com",
      password: defaultPassword,
      role: "superadmin",
      imageUrl: "",
      position: "",
      allowedRoutes: [
        "/home",
        "/screensavers",
        "/system-logs",
        "/users",
        "/user-session",
      ],
    },
  });

  // Create departments
  const [afmd, csd] = await Promise.all([
    prisma.department.create({
      data: {
        name: "Accounting And Financial Management Department",
        code: "AFMD",
      },
    }),
    prisma.department.create({
      data: {
        name: "Commercial Services Department",
        code: "CSD",
      },
    }),
  ]);

  // Create transactions (services)
  const [payment, newServiceApplication, customerWelfare] = await Promise.all([
    prisma.transaction.create({
      data: {
        id: "0843097b-688d-481e-823f-aab0b086925a",
        code: "P",
        name: "Payment",
        departmentId: afmd.id,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "cc3dc11d-bd7b-45fc-9dd8-d8e8894851ec",
        code: "A",
        name: "New Service Application",
        departmentId: csd.id,
      },
    }),
    prisma.transaction.create({
      data: {
        id: "2e2dc2cb-df8e-4217-a2c1-1ca5c5571e5c",
        code: "CW",
        name: "Customer Welfare",
        departmentId: csd.id,
      },
    }),
  ]);

  // Create admin accounts
  const [cwNsaAdmin, paymentAdmin] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Sharon",
        middleName: "C",
        lastName: "Gadayan",
        nameExtension: "MPA",
        email: "sharongadayan@gscwd.com",
        password: defaultPassword,
        role: "admin",
        imageUrl: "GADAYAN.jpg",
        departmentId: csd.id,
        position: "Department Manager A",
        allowedRoutes: ["/home", "/notifications"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Julincris",
        middleName: "M",
        lastName: "Ucat",
        nameExtension: "MBA",
        email: "julincrisucat@gscwd.com",
        password: defaultPassword,
        role: "admin",
        imageUrl: "UCAT.jpg",
        departmentId: afmd.id,
        position: "Department Manager A",
        allowedRoutes: ["/home", "/notifications"],
      },
    }),
  ]);

  // Update departments with managers
  await Promise.all([
    prisma.department.update({
      where: { id: csd.id },
      data: { managerId: cwNsaAdmin.id },
    }),
    prisma.department.update({
      where: { id: afmd.id },
      data: { managerId: paymentAdmin.id },
    }),
  ]);

  // Create supervisors and assign to transactions
  const [cwSupervisor, nsaSupervisor, paySupervisor] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Jennifer",
        middleName: "B",
        lastName: "Manguramas",
        nameExtension: "LPT, MPA",
        email: "jennifermanguramas@gscwd.com",
        password: defaultPassword,
        role: "superuser",
        assignedTransactionId: customerWelfare.id,
        imageUrl: "MANGURAMAS.jpg",
        departmentId: csd.id,
        position: "Supervising Customer Service Officer",
        allowedRoutes: [
          "/home",
          "/counters",
          "/notifications",
          "/queuing",
          "/reports",
          "/transactions",
          "/personnel",
        ],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Norberto Alvin",
        middleName: "H",
        lastName: "Brosoto",
        email: "norbertoalvinbrosoto@gscwd.com",
        password: defaultPassword,
        role: "superuser",
        assignedTransactionId: newServiceApplication.id,
        imageUrl: "BROSOTO.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant A",
        allowedRoutes: [
          "/home",
          "/counters",
          "/notifications",
          "/queuing",
          "/reports",
          "/transactions",
          "/personnel",
        ],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Marites",
        middleName: "G",
        lastName: "Pelobillo",
        email: "maritespelobillo@gscwd.com",
        password: defaultPassword,
        role: "superuser",
        assignedTransactionId: payment.id,
        imageUrl: "PELOBILLO-3.jpg",
        departmentId: afmd.id,
        position: "Cashiering Services Chief A",
        allowedRoutes: [
          "/home",
          "/counters",
          "/notifications",
          "/queuing",
          "/reports",
          "/transactions",
          "/personnel",
        ],
      },
    }),
  ]);

  // Update transactions with supervisors
  await Promise.all([
    prisma.transaction.update({
      where: { id: customerWelfare.id },
      data: { supervisorId: cwSupervisor.id },
    }),
    prisma.transaction.update({
      where: { id: newServiceApplication.id },
      data: { supervisorId: nsaSupervisor.id },
    }),
    prisma.transaction.update({
      where: { id: payment.id },
      data: { supervisorId: paySupervisor.id },
    }),
  ]);

  // Create service types for each transaction
  const [cwServiceTypes, nsaServiceTypes, payServiceTypes] = await Promise.all([
    prisma.serviceType.createMany({
      data: [
        {
          name: "Bill Inquiry",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Bill Verification (High Consumption)",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Partial Payment",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Promissory Note",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Request For Change In Account Data And Information",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Request For Disconnection",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Request For Meter Test",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Request For Reconnection",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Request For Transfer Meter",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Repair Of Leakage/s Before Meter",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "SCP Application/Renewal",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Water Sales",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Maintenance Requests",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Others",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
      ],
    }),
    prisma.serviceType.createMany({
      data: [
        {
          name: "Inquiry About New Service Application",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Encode Applicant Details",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Approve Payment (Survey Fee)",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Schedule Orientation",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Follow-up on Survey Results",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Estimate of Materials",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Verify/Check Requirements",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Approve Payment (Estimate of Materials)",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Assign BM",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Follow-up on Installation",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Inquiry About Community Petition",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Inquiry on Cost Sharing",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Inquiry on Big-Size Meter",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "Others",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
      ],
    }),
    prisma.serviceType.createMany({
      data: [
        {
          name: "Payment",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
      ],
    }),
  ]);

  // Get created service types
  const serviceTypes = await prisma.serviceType.findMany();
  const cwTypes = serviceTypes.filter(
    (st) => st.transactionId === customerWelfare.id
  );
  const nsaTypes = serviceTypes.filter(
    (st) => st.transactionId === newServiceApplication.id
  );
  const payTypes = serviceTypes.filter((st) => st.transactionId === payment.id);

  // Create counters for each transaction
  const [cwCounters, nsaCounters, payCounters] = await Promise.all([
    prisma.counter.createMany({
      data: [
        {
          name: "Customer Welfare 1",
          code: "CW-1",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Customer Welfare 2",
          code: "CW-2",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Customer Welfare 3",
          code: "CW-3",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
        {
          name: "Customer Welfare 4",
          code: "CW-4",
          transactionId: customerWelfare.id,
          departmentId: csd.id,
        },
      ],
    }),
    prisma.counter.createMany({
      data: [
        {
          name: "New Service Application A",
          code: "NSA-A",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
        {
          name: "New Service Application B",
          code: "NSA-B",
          transactionId: newServiceApplication.id,
          departmentId: csd.id,
        },
      ],
    }),
    prisma.counter.createMany({
      data: [
        {
          name: "Cashier 1",
          code: "CASHIER-1",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 2",
          code: "CASHIER-2",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 3",
          code: "CASHIER-3",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 4",
          code: "CASHIER-4",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 5",
          code: "CASHIER-5",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 6",
          code: "CASHIER-6",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 7",
          code: "CASHIER-7",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
        {
          name: "Cashier 8",
          code: "CASHIER-8",
          transactionId: payment.id,
          departmentId: afmd.id,
        },
      ],
    }),
  ]);

  // Get created counters
  const counters = await prisma.counter.findMany();
  const cwCountersList = counters.filter(
    (c) => c.transactionId === customerWelfare.id
  );
  const nsaCountersList = counters.filter(
    (c) => c.transactionId === newServiceApplication.id
  );
  const payCountersList = counters.filter(
    (c) => c.transactionId === payment.id
  );

  // Create staff accounts and assign to counters
  await Promise.all([
    prisma.user.create({
      data: {
        firstName: "Donna Mae",
        middleName: "J",
        lastName: "Datago",
        email: "donnamaedatago@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: customerWelfare.id,
        imageUrl: "DATAGO.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant B",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Shayne Ann",
        middleName: "B",
        lastName: "Lee",
        email: "shayneannlee@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: customerWelfare.id,
        imageUrl: "LEE.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant B",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Catherine Mae",
        middleName: "P",
        lastName: "Tomeldan",
        nameExtension: "MPA",
        email: "catherinemaetomeldan@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: customerWelfare.id,
        imageUrl: "TOMELDAN.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant A",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Katherine",
        middleName: "E",
        lastName: "Leyson",
        email: "katherineleyson@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: newServiceApplication.id,
        imageUrl: "LEYSON.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant C",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Ferly",
        middleName: "V",
        lastName: "De Juan",
        email: "ferlydejuan@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: newServiceApplication.id,
        imageUrl: "DE-JUAN.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant A",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Lilian",
        middleName: "S",
        lastName: "Servano",
        email: "lilianservano@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: newServiceApplication.id,
        imageUrl: "SERVANO.jpg",
        departmentId: csd.id,
        position: "Customer Service Assistant C",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Fanny",
        middleName: "H",
        lastName: "Grafia",
        email: "fannygrafia@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: newServiceApplication.id,
        imageUrl: "GRAFIA.jpg",
        departmentId: csd.id,
        position: "Water Maintenance Man A",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
    prisma.user.create({
      data: {
        firstName: "Felnor",
        middleName: "G",
        lastName: "Latorre",
        email: "felnorlatorre@gscwd.com",
        password: defaultPassword,
        role: "user",
        assignedTransactionId: payment.id,
        imageUrl: "LATORRE.jpg",
        departmentId: afmd.id,
        startTransactionHotkey: "z",
        completeTransactionHotkey: "x",
        transferHotkey: "c",
        markAsLapsedHotkey: "v",
        nextTicketHotkey: "a",
        nextLapsedTicketHotkey: "s",
        nextSpecialTicketHotkey: "d",
        nextLapsedSpecialTicketHotkey: "f",
        position: "Cashier C",
        allowedRoutes: ["/home", "/queuing", "/reports"],
      },
    }),
  ]);

  // Create screensaver images
  await prisma.screensaver.createMany({
    data: [],
  });

  // Create routes
  await prisma.route.createMany({
    data: [
      {
        path: "/home",
        name: "Home",
      },
      {
        path: "/counters",
        name: "Counters",
      },
      {
        path: "/queuing",
        name: "Queuing",
      },
      {
        path: "/reports",
        name: "Reports",
      },
      {
        path: "/screensavers",
        name: "Screensavers",
      },
      {
        path: "/transactions",
        name: "Transactions",
      },
      {
        path: "/system-logs",
        name: "System Logs",
      },
      {
        path: "/personnel",
        name: "Personnel",
      },
      {
        path: "/notifications",
        name: "Notifications",
      },
      {
        path: "/users",
        name: "Users",
      },
      {
        path: "/user-session",
        name: "User Session",
      },
    ],
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
