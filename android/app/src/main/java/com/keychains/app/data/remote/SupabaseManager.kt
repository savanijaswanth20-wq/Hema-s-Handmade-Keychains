package com.keychains.app.data.remote

import com.keychains.app.data.model.*
import io.github.janatennert.supabase.SupabaseClient
import io.github.janatennert.supabase.createSupabaseClient
import io.github.janatennert.supabase.postgrest.Postgrest
import io.github.janatennert.supabase.postgrest.postgrest
import io.github.janatennert.supabase.postgrest.query.Columns
import io.github.janatennert.supabase.gotrue.GoTrue
import io.github.janatennert.supabase.gotrue.gotrue
import io.github.janatennert.supabase.gotrue.providers.builtin.Email
import io.github.janatennert.supabase.storage.Storage
import io.github.janatennert.supabase.storage.storage
import io.github.janatennert.supabase.realtime.Realtime
import io.github.janatennert.supabase.realtime.realtime
import io.github.janatennert.supabase.realtime.postgresChangeFlow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.io.File

object SupabaseManager {
    
    // Replace with your actual Supabase configurations at build time or load from gradle config
    private const val SUPABASE_URL = "https://your-project.supabase.co"
    private const val SUPABASE_ANON_KEY = "your-anon-key-here"

    lateinit var client: SupabaseClient
        private set

    init {
        try {
            client = createSupabaseClient(
                supabaseUrl = SUPABASE_URL,
                supabaseKey = SUPABASE_ANON_KEY
            ) {
                install(Postgrest)
                install(GoTrue) {
                    // Config persistence or session cache
                    scheme = "keychains-app"
                    host = "login"
                }
                install(Storage)
                install(Realtime)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // =========================================================================
    // AUTHENTICATION OPERATIONS
    // =========================================================================
    suspend fun signUp(email: String, password: String, name: String): Boolean {
        return try {
            client.gotrue.signUpWith(Email) {
                this.email = email
                this.password = password
                options = buildJsonObject {
                    put("name", name)
                    put("role", "customer")
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun signIn(email: String, password: String): CustomerProfile? {
        return try {
            val session = client.gotrue.signInWith(Email) {
                this.email = email
                this.password = password
            }
            
            // Query details from profile/customers table
            val userId = session?.user?.id ?: return null
            client.postgrest["customers"]
                .select(columns = Columns.ALL) {
                    filter {
                        eq("id", userId)
                    }
                }
                .decodeSingle<CustomerProfile>()
        } catch (e: Exception) {
            null
        }
    }

    suspend fun signOut() {
        try {
            client.gotrue.signOut()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun resetPassword(email: String): Boolean {
        return try {
            client.gotrue.sendPasswordResetEmail(email = email)
            true
        } catch (e: Exception) {
            false
        }
    }

    // =========================================================================
    // PRODUCTS OPERATIONS
    // =========================================================================
    suspend fun getProducts(): List<Product> {
        return try {
            client.postgrest["products"]
                .select(columns = Columns.ALL)
                .decodeList<Product>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    // =========================================================================
    // ORDERS & PAYMENT OPERATIONS
    // =========================================================================
    suspend fun submitOrder(order: Order, items: List<OrderItem>): Boolean {
        return try {
            // 1. Insert order metadata
            client.postgrest["orders"].insert(order)

            // 2. Insert order items
            val itemsWithOrderId = items.map { it.copy(orderId = order.id) }
            client.postgrest["order_items"].insert(itemsWithOrderId)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getOrders(customerId: String? = null): List<Order> {
        return try {
            val query = client.postgrest["orders"].select(columns = Columns.ALL)
            val orders = if (customerId != null) {
                query.filter { eq("customer_id", customerId) }.decodeList<Order>()
            } else {
                query.decodeList<Order>()
            }
            
            // Map items for each order
            orders.map { order ->
                val orderItems = client.postgrest["order_items"]
                    .select(columns = Columns.ALL) {
                        filter { eq("order_id", order.id) }
                    }
                    .decodeList<OrderItem>()
                order.copy(items = orderItems)
            }
        } catch (e: Exception) {
            emptyList()
        }
    }

    // =========================================================================
    // REVIEWS OPERATIONS
    // =========================================================================
    suspend fun submitReview(review: Review): Boolean {
        return try {
            client.postgrest["reviews"].insert(review)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun getReviews(productId: String): List<Review> {
        return try {
            client.postgrest["reviews"]
                .select(columns = Columns.ALL) {
                    filter { eq("product_id", productId) }
                }
                .decodeList<Review>()
        } catch (e: Exception) {
            emptyList()
        }
    }

    // =========================================================================
    // STORAGE UPLOADS
    // =========================================================================
    suspend fun uploadProductImage(file: File): String? {
        return try {
            val bucket = client.storage["product-images"]
            val fileName = "${System.currentTimeMillis()}-${file.name}"
            bucket.upload(fileName, file.readBytes())
            bucket.publicUrl(fileName)
        } catch (e: Exception) {
            null
        }
    }

    // =========================================================================
    // REAL-TIME DATA FLOWS (REAL-TIME SUBSCRIPTIONS)
    // =========================================================================
    fun getProductRealtimeUpdates(): Flow<Product> {
        val channel = client.realtime.createChannel("products-update-channel")
        return channel.postgresChangeFlow<Product>(schema = "public") {
            table = "products"
        }.map { change -> change.record ?: throw Exception("Invalid update record") }
    }

    fun getOrderRealtimeUpdates(): Flow<Order> {
        val channel = client.realtime.createChannel("orders-update-channel")
        return channel.postgresChangeFlow<Order>(schema = "public") {
            table = "orders"
        }.map { change -> change.record ?: throw Exception("Invalid update record") }
    }
}
