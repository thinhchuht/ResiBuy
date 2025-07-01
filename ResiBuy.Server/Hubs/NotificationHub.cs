namespace ResiBuy.Server.Hubs;

public class NotificationHub(IUserDbService userDbService) : Hub
{
    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
            Console.WriteLine($"Client connected with userId: {userId}");
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
                    if (user.Stores.Count() > 0)
                    {
                        await Groups.AddToGroupAsync(Context.ConnectionId, Constants.StoreHubGroup);
                    }
                }
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, Constants.AllHubGroup);
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in OnConnectedAsync: {ex.Message}");
        }

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