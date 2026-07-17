package com.keychains.app.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.SerialName

@Serializable
data class Category(
    val id: String? = null,
    val name: String,
    val description: String? = null
)

@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    @SerialName("category_id") val categoryId: String? = null,
    val price: Double,
    val stock: Int,
    val images: List<String> = emptyList(),
    val rating: Double = 5.0,
    @SerialName("reviews_count") val reviewsCount: Int = 0,
    val tag: String? = null
)

@Serializable
data class CustomerProfile(
    val id: String,
    val email: String,
    val name: String? = null,
    val phone: String? = null,
    val address: String? = null,
    val role: String = "customer"
)

@Serializable
data class OrderItem(
    val id: String? = null,
    @SerialName("order_id") val orderId: String? = null,
    @SerialName("product_id") val productId: String,
    @SerialName("product_name") val productName: String,
    @SerialName("product_image") val productImage: String? = null,
    val quantity: Int,
    val price: Double
)

@Serializable
data class Order(
    val id: String,
    @SerialName("customer_id") val customerId: String? = null,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_phone") val customerPhone: String,
    val address: String,
    @SerialName("custom_message") val customMessage: String? = null,
    @SerialName("payment_method") val paymentMethod: String = "UPI",
    @SerialName("payment_id") val paymentId: String? = null,
    @SerialName("payment_status") val paymentStatus: String = "Pending",
    val total: Double,
    val status: String = "Pending",
    @SerialName("created_at") val createdAt: String? = null,
    val items: List<OrderItem> = emptyList()
)

@Serializable
data class Review(
    val id: String,
    @SerialName("product_id") val productId: String,
    @SerialName("product_name") val productName: String,
    @SerialName("customer_name") val customerName: String,
    @SerialName("customer_id") val customerId: String? = null,
    val rating: Int,
    val text: String,
    @SerialName("created_at") val createdAt: String? = null
)

@Serializable
data class CartItem(
    val id: String? = null,
    @SerialName("user_id") val userId: String,
    @SerialName("product_id") val productId: String,
    val quantity: Int
)

@Serializable
data class AdminSettings(
    @SerialName("upi_id") val upiId: String,
    @SerialName("upi_name") val upiName: String,
    @SerialName("banner_message") val bannerMessage: String,
    @SerialName("business_name") val businessName: String,
    @SerialName("whatsapp_number") val whatsappNumber: String,
    @SerialName("instagram_id") val instagramId: String,
    @SerialName("qr_image_url") val qrImageUrl: String? = null,
    @SerialName("logo_url") val logoUrl: String? = null
)
