namespace ResiBuy.Server.Hubs;

public class NotificationHub(IUserDbService userDbService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            
            var user = await userDbService.GetUserById(userId);
            if (user != null)
            {
                if (user.Roles.Contains(Constants.AdminRole))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, Constants.AdminHubGroup);
                }
                if (user.Roles.Contains(Constants.SellerRole))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, Constants.SellerHubGroup);
                }
                if (user.Roles.Contains(Constants.CustomerRole))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, Constants.CustomerHubGroup);
                }
                if (user.Roles.Contains(Constants.ShipperRole))
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, Constants.ShipperHubGroup);
                }
            }
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, Constants.AllHubGroup);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);

            var user = await userDbService.GetUserById(userId);
            if (user != null)
            {
                if (user.Roles.Contains(Constants.AdminRole))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, Constants.AdminHubGroup);
                }
                if (user.Roles.Contains(Constants.SellerRole))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, Constants.SellerHubGroup);
                }
                if (user.Roles.Contains(Constants.CustomerRole))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, Constants.CustomerHubGroup);
                }
                if (user.Roles.Contains(Constants.ShipperRole))
                {
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, Constants.ShipperHubGroup);
                }
            }
        }
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, Constants.AllHubGroup);
        await base.OnDisconnectedAsync(exception);
    }
} 