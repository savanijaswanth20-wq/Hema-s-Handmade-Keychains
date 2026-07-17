package com.keychains.app.ui

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.keychains.app.data.model.*
import com.keychains.app.data.remote.SupabaseManager
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(
                colorScheme = lightColorScheme(
                    primary = Color(0xFFE05275), // Brand Rose
                    secondary = Color(0xFFFFE3E8),
                    background = Color(0xFFFFF7F8),
                    surface = Color.White
                )
            ) {
                MainAppScreen()
            }
        }
    }
}

sealed class Screen {
    object Home : Screen()
    object Cart : Screen()
    object Profile : Screen()
    object Admin : Screen()
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScreen() {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
    var products by remember { mutableStateOf<List<Product>>(emptyList()) }
    var cartItems by remember { mutableStateOf<List<Product>>(emptyList()) }
    var ordersList by remember { mutableStateOf<List<Order>>(emptyList()) }
    var isLoading by remember { mutableStateOf(false) }
    var currentUser by remember { mutableStateOf<CustomerProfile?>(null) }
    var isAuthDialogOpen by remember { mutableStateOf(false) }

    // Simulation of Local Cache / Seed Data for premium offline-ready capabilities
    LaunchedEffect(Unit) {
        isLoading = true
        // Try fetching from Supabase database
        val fetched = SupabaseManager.getProducts()
        if (fetched.isNotEmpty()) {
            products = fetched
        } else {
            // Offline Cache / Seed Fallback
            products = listOf(
                Product("prod-1", "Cute Heart Penguin Keychain", "Super glossy clay penguin holding a tiny red heart.", "Animal Series", null, 150.0, 12, listOf("https://images.unsplash.com/photo-1544816155-12df9643f363?w=500")),
                Product("prod-2", "handmade bunny charm", "A super cute chubby white bunny with tiny cheeks.", "Animal Series", null, 150.0, 10, listOf("https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500")),
                Product("prod-3", "Penguin charm", "Handmade glossy baby penguin holding a yellow flower.", "Animal Series", null, 150.0, 8, listOf("https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500")),
                Product("prod-4", "Miniature Clay Donut", "Glazed pink chocolate donut with micro sprinkles.", "Food Series", null, 150.0, 15, listOf("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500"))
            )
        }
        isLoading = false

        // Listen for Real-time database updates from Supabase asynchronously
        coroutineScope.launch {
            try {
                SupabaseManager.getProductRealtimeUpdates().collect { updatedProduct ->
                    products = products.map { if (it.id == updatedProduct.id) updatedProduct else it }
                    Toast.makeText(context, "Product inventory synced in Real-time!", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                // Ignore real-time connection errors if Supabase keys not set yet
            }
        }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { 
                    Text(
                        text = "Hema's Tiny Universe",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFE05275)
                    )
                },
                actions = {
                    if (currentUser == null) {
                        IconButton(onClick = { isAuthDialogOpen = true }) {
                            Icon(Icons.Default.AccountCircle, contentDescription = "Login", tint = Color(0xFFE05275))
                        }
                    } else {
                        IconButton(onClick = {
                            if (currentUser?.role == "admin") {
                                currentScreen = Screen.Admin
                            } else {
                                Toast.makeText(context, "Welcome, ${currentUser?.name}!", Toast.LENGTH_SHORT).show()
                            }
                        }) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFFE05275))
                        }
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 4.dp
            ) {
                NavigationBarItem(
                    selected = currentScreen is Screen.Home,
                    onClick = { currentScreen = Screen.Home },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home", modifier = Modifier.size(24.dp)) },
                    label = { Text("Shop", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen is Screen.Cart,
                    onClick = { currentScreen = Screen.Cart },
                    icon = { 
                        BadgedBox(badge = {
                            if (cartItems.isNotEmpty()) {
                                Badge { Text(cartItems.size.toString()) }
                            }
                        }) {
                            Icon(Icons.Default.ShoppingCart, contentDescription = "Cart", modifier = Modifier.size(24.dp))
                        }
                    },
                    label = { Text("Cart", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen is Screen.Profile,
                    onClick = { currentScreen = Screen.Profile },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile", modifier = Modifier.size(24.dp)) },
                    label = { Text("Orders", fontSize = 10.sp) }
                )
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFFFF7F8))
                .padding(innerPadding)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = Color(0xFFE05275)
                )
            } else {
                when (currentScreen) {
                    Screen.Home -> ProductGridScreen(
                        products = products,
                        onAddToCart = { product ->
                            cartItems = cartItems + product
                            Toast.makeText(context, "${product.name} added to cart!", Toast.LENGTH_SHORT).show()
                        }
                    )
                    Screen.Cart -> CartScreen(
                        cartItems = cartItems,
                        onRemove = { cartItems = cartItems - it },
                        onCheckout = { name, phone, address, message ->
                            val newOrder = Order(
                                id = "HEMA-" + (1000..9999).random(),
                                customerName = name,
                                customerPhone = phone,
                                address = address,
                                customMessage = message,
                                total = cartItems.sumOf { it.price },
                                status = "Pending"
                            )
                            ordersList = listOf(newOrder) + ordersList
                            cartItems = emptyList()
                            currentScreen = Screen.Profile
                            Toast.makeText(context, "Order Placed Successfully! Status: Pending", Toast.LENGTH_LONG).show()
                        }
                    )
                    Screen.Profile -> OrderHistoryScreen(orders = ordersList)
                    Screen.Admin -> AdminPanelScreen(
                        products = products,
                        onAddProduct = { products = listOf(it) + products },
                        onDeleteProduct = { id -> products = products.filter { it.id != id } }
                    )
                }
            }

            // Simple Auth Dialog Simulation (Signup / Signin)
            if (isAuthDialogOpen) {
                AlertDialog(
                    onDismissRequest = { isAuthDialogOpen = false },
                    title = { Text("Customer Sign In") },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            var email by remember { mutableStateOf("") }
                            var password by remember { mutableStateOf("") }
                            OutlinedTextField(
                                value = email,
                                onValueChange = { email = it },
                                label = { Text("Email") },
                                modifier = Modifier.fillMaxWidth()
                            )
                            OutlinedTextField(
                                value = password,
                                onValueChange = { password = it },
                                label = { Text("Password") },
                                modifier = Modifier.fillMaxWidth()
                            )
                            Button(
                                onClick = {
                                    if (email.contains("admin")) {
                                        currentUser = CustomerProfile("admin-id", email, "Hema", "", "", "admin")
                                        Toast.makeText(context, "Logged in as Admin!", Toast.LENGTH_SHORT).show()
                                    } else {
                                        currentUser = CustomerProfile("cust-id", email, email.split("@")[0], "", "", "customer")
                                        Toast.makeText(context, "Welcome, ${currentUser?.name}!", Toast.LENGTH_SHORT).show()
                                    }
                                    isAuthDialogOpen = false
                                },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Text("Sign In / Sign Up")
                            }
                        }
                    },
                    confirmButton = {}
                )
            }
        }
    }
}

@Composable
fun ProductGridScreen(products: List<Product>, onAddToCart: (Product) -> Unit) {
    Column(modifier = Modifier.padding(8.dp)) {
        Text(
            text = "✨ Clay Charms & Keychains",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color.DarkGray,
            modifier = Modifier.padding(bottom = 8.dp)
        )
        // Responsive 2-column Grid for phones (Compact size)
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(products) { product ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        AsyncImage(
                            model = product.images.firstOrNull(),
                            contentDescription = product.name,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(110.dp)
                                .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Column(modifier = Modifier.padding(6.dp)) {
                            Text(
                                text = product.name,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = product.category,
                                fontSize = 10.sp,
                                color = Color.Gray
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "₹${product.price.toInt()}",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0xFFE05275)
                                )
                                Button(
                                    onClick = { onAddToCart(product) },
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("Add", fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(
    cartItems: List<Product>,
    onRemove: (Product) -> Unit,
    onCheckout: (String, String, String, String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var customMsg by remember { mutableStateOf("") }

    if (cartItems.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("Your basket is empty 🌸", color = Color.Gray, fontSize = 14.sp)
        }
    } else {
        LazyColumn(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text("Your Cart Items", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            items(cartItems) { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(8.dp))
                        .padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        AsyncImage(
                            model = item.images.firstOrNull(),
                            contentDescription = null,
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(4.dp)),
                            contentScale = ContentScale.Crop
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(item.name, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("₹${item.price.toInt()}", fontSize = 11.sp, color = Color.Gray)
                        }
                    }
                    IconButton(onClick = { onRemove(item) }) {
                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.LightGray)
                    }
                }
            }
            item {
                Divider()
                Spacer(modifier = Modifier.height(4.dp))
                Text("Checkout Details", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Name", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Delivery Address", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = customMsg,
                    onValueChange = { customMsg = it },
                    label = { Text("Custom Engraving Request (Optional)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = {
                        if (name.isNotBlank() && phone.isNotBlank() && address.isNotBlank()) {
                            onCheckout(name, phone, address, customMsg)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE05275))
                ) {
                    Text("Place Order via UPI (Total: ₹${cartItems.sumOf { it.price }.toInt()})")
                }
            }
        }
    }
}

@Composable
fun OrderHistoryScreen(orders: List<Order>) {
    if (orders.isEmpty()) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("No orders placed yet.", color = Color.Gray, fontSize = 14.sp)
        }
    } else {
        LazyColumn(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            item {
                Text("Your Order History", fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
            items(orders) { order ->
                Card(
                    shape = RoundedCornerShape(8.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(order.id, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text(
                                text = order.status,
                                color = Color(0xFFE05275),
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 12.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Address: ${order.address}", fontSize = 11.sp, color = Color.DarkGray)
                        Text("Total Amount: ₹${order.total.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun AdminPanelScreen(
    products: List<Product>,
    onAddProduct: (Product) -> Unit,
    onDeleteProduct: (String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Animal Series") }

    LazyColumn(
        modifier = Modifier.padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text("Admin - Manage Products", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }
        item {
            Card(
                shape = RoundedCornerShape(8.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("Add New Keychain Product", fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Product Name") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = price,
                        onValueChange = { price = it },
                        label = { Text("Price (INR)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = stock,
                        onValueChange = { stock = it },
                        label = { Text("Stock Quantity") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Button(
                        onClick = {
                            if (name.isNotBlank() && price.isNotBlank() && stock.isNotBlank()) {
                                onAddProduct(
                                    Product(
                                        id = "prod-" + System.currentTimeMillis(),
                                        name = name,
                                        description = "Handcrafted clay keychain",
                                        category = category,
                                        price = price.toDoubleOrNull() ?: 150.0,
                                        stock = stock.toIntOrNull() ?: 10,
                                        images = listOf("https://images.unsplash.com/photo-1544816155-12df9643f363?w=500")
                                    )
                                )
                                name = ""
                                price = ""
                                stock = ""
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Save New Product")
                    }
                }
            }
        }
        item {
            Text("Current Stock Items", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        items(products) { prod ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(8.dp))
                    .padding(8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(prod.name, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    Text("Price: ₹${prod.price.toInt()} | Stock: ${prod.stock} left", fontSize = 11.sp)
                }
                IconButton(onClick = { onDeleteProduct(prod.id) }) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color.Red)
                }
            }
        }
    }
}
