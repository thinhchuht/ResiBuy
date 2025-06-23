namespace ResiBuy.Server.Common
{
    public class Constants
    {
        //ROlé
        public const string AdminRole = "ADMIN";
        public const string ShipperRole = "SHIPPER";
        public const string CustomerRole = "CUSTOMER";
        public const string SellerRole = "SELLER";
        public static string[] AllowedRoles = { AdminRole, ShipperRole, CustomerRole, SellerRole };

        //Tài khoản admin default
        public const string DefaultAdmidId = "adm_df";
        public const string DefaultAdminPassword = "admin@123";
        public const string DefaultAdminEmail = "admin@123";
        public const string DefaultAdminFullName = "Administrator";
        public const string DefaultAdminPhone = "admin";
        public const string DefaultAdminIdnetityNumber = "admin";

        //Default Password
        public const string DefaulAccountPassword = "123456";

        //Hub Group
        public const string AllHubGroup = "all";
        public const string AdminHubGroup = "admin";
        public const string SellerHubGroup = "seller";
        public const string CustomerHubGroup = "customer";
        public const string ShipperHubGroup = "shipper";

        //Hub events
        public const string CartItemAdded = "CartItemAdded";
        public const string OrderCreated = "OrderCreated";
        public const string CartItemDeleted = "CartItemDeleted";
        public const string OrderStatusChanged = "OrderStatusChanged";

        //regex pattern
        public const string EmailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
        public const string PhoneNumberPattern = @"^(0\d{9}|\+84\d{9})$";
        public const string IndentityNumberPattern = @"^\d{12}$";
        public const string PasswordPattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$";
    }
}
