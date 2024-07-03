const express = require("express");
const router = express.Router();

const AdminRoute = require("./routes/admin_route");
const UserRoute = require("./routes/user_route");
const fileUploadRouter = require("./routes/file_upload_route");
const AddressRoute = require("./routes/address_route");
const CartRoute = require("./routes/cart_route");
const OrderRoute = require("./routes/order_route");
const ReviewRoute = require("./routes/review_route");
const WishlistRoute = require("./routes/wishlist_route");
const TestRoute = require("./routes/test_route");  /* testing purpose */
const ProductRoute = require("./routes/product_routes");
const CategoryRoute = require("./routes/category_route");
const HomeRoute = require("./routes/home_route");
const CashfreeRoute = require("./routes/cashfree_payment_route");
const ServiceRoute = require("./routes/service_route")
const LocationRoute = require("./routes/location_route")

router.use("/location", LocationRoute)
router.use("/service", ServiceRoute)
router.use("/admin", AdminRoute);
router.use("/user", UserRoute);
router.use("/file", fileUploadRouter);
router.use("/adress", AddressRoute);
router.use("/cart", CartRoute);
router.use("/review", ReviewRoute);
router.use("/wishlist", WishlistRoute);
router.use("/order", OrderRoute);
router.use("/test", TestRoute);   /* testing purpose */
router.use("/product", ProductRoute);
router.use("/category", CategoryRoute);
router.use("/home", HomeRoute);
router.use("/cashfree", CashfreeRoute);

/* =============================== Admin routes ====================================== */

const AdminCategoryRoute = require("./routes/admin/category_route");
const MakeRoute = require("./routes/admin/make_route");
const ModelRoute = require("./routes/admin/model_route");
const YearRoute = require("./routes/admin/year_route");
const AdminProductRoute = require("./routes/admin/product_routes");
const FaqRoute = require("./routes/admin/faq_route");
const StockRoute = require("./routes/admin/stock_route");
const SupplierRoute = require("./routes/admin/supplier_rotes");
const CustomerRoute = require("./routes/admin/customer_route");
const AdminOrderRoute = require("./routes/admin/order_route");
const AdminCouponRoute = require("./routes/admin/admin_coupon_route");
const AdminBrandRoute = require("./routes/admin/brand_route");
const AdminNotificationRoute = require("./routes/admin/admin_notification_route");
const VehicleTypeRoute = require("./routes/admin/vehicle_type_route");
const VariantRoute = require("./routes/admin/variant_route");
const ModelYearRoute = require("./routes/admin/model_year_route");
const ModelVariantRoute = require("./routes/admin/model_variant_route");
const ProductVechicleRoute = require("./routes/admin/product_vehicle_route");
const DashboardRoute = require("./routes/admin/dashboard_route");

router.use("/admin/category", AdminCategoryRoute);
router.use("/admin/make", MakeRoute);
router.use("/admin/model", ModelRoute);
router.use("/admin/year", YearRoute);
router.use("/admin/product", AdminProductRoute);
router.use("/admin/faq", FaqRoute);
router.use("/admin/stock", StockRoute);
router.use("/admin/supplier", SupplierRoute);
router.use("/admin/customer", CustomerRoute);
router.use("/admin/order", AdminOrderRoute);
router.use("/admin/coupon", AdminCouponRoute);
router.use("/admin/brand", AdminBrandRoute);
router.use("/admin/notification", AdminNotificationRoute);
router.use("/admin/variant", VariantRoute);
router.use("/admin/model-year", ModelYearRoute);
router.use("/admin/model-variant", ModelVariantRoute);
router.use("/admin/product_vehicle", ProductVechicleRoute);
router.use("/admin/vehicle-type", VehicleTypeRoute);
router.use("/admin/dashboard", DashboardRoute);

/* ============================ Retailer routes ===================================== */

const RetailerCustomerRoute = require("./routes/retailer/customer_route");
const RetailerSupplierRoute = require("./routes/retailer/supplier_route");
const RetailerProductRoute = require("./routes/retailer/product_route");
const RetailerOrderRoute = require("./routes/retailer/order_route");
const RetailerOrderSupplierRoute = require("./routes/retailer/supplier_order_routes")
const RetailerStockRoute = require("./routes/retailer/stock_routes");
const RetailerExpenseRoute = require("./routes/retailer/expense_route");
const RetailerHomeRoute = require("./routes/retailer/home_route");
const RetailerProfileRoute = require("./routes/retailer/profile_route");
const RetailerJournalRoute = require("./routes/retailer/journal_route");
const RetailerProtfolioRoute = require("./routes/retailer/portfolio_route");
const RetailerNotificationRoute = require("./routes/retailer/notification_route");
const ReportManagmentRoute = require("./routes/retailer/report_managment_route");
//const AvailableProductNotificationRoute = require("./routes/retailer/available_product_notification_route");

router.use("/retailer/customer", RetailerCustomerRoute);
router.use("/retailer/supplier", RetailerSupplierRoute);
router.use("/retailer/product", RetailerProductRoute);
router.use("/retailer/order", RetailerOrderRoute);
router.use("/retailer/ordersupplier", RetailerOrderSupplierRoute);
router.use("/retailer/stock", RetailerStockRoute);
router.use("/retailer/expense", RetailerExpenseRoute);
router.use("/retailer/home", RetailerHomeRoute);
router.use("/retailer/profile", RetailerProfileRoute);
router.use("/retailer/journal", RetailerJournalRoute);
router.use("/retailer/portfolio", RetailerProtfolioRoute);
router.use("/retailer/notification", RetailerNotificationRoute);
router.use("/retailer/report", ReportManagmentRoute);
//router.use("/retailer/available-notification", AvailableProductNotificationRoute);


/* ============================ Retailer routes ===================================== */
const BrandRoute = require("./routes/brand_route");
router.use("/brand", BrandRoute);

const VehicleRoute = require("./routes/vehicle_route");
router.use("/vehicle", VehicleRoute);

const TimeslotRoute = require("./routes/timesllot_routes");
router.use("/time-slot", TimeslotRoute)



module.exports = router;