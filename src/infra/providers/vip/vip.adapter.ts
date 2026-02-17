import {
  IProviderPort,
  ProviderBalance,
  ProviderProduct,
  ProviderPurchaseRequest,
  ProviderPurchaseResponse,
  ProviderHealthCheck,
} from "@/src/core/ports/provider.port";
import { ProviderType, ProviderStatus } from "@/src/core/domain/enums/provider.enum";
import { ProviderError } from "@/src/core/domain/errors/provider.errors";

export class VipResellerAdapter implements IProviderPort {
  private apiKey: string;
  private apiId: string;
  private sign: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.VIP_API_KEY || "";
    this.apiId = process.env.VIP_API_ID || "";
    this.sign = process.env.VIP_SIGN || "";
    this.baseUrl = process.env.VIP_BASE_URL || "https://vip-reseller.co.id/api";
  }

  getProviderType(): ProviderType {
    return ProviderType.VIP_RESELLER;
  }

  async checkBalance(): Promise<ProviderBalance> {
    try {
      // VIP Reseller: sign = MD5(API_ID + API_KEY)
      const sign = this.sign || this.generateSignature();
      
      const requestBody = {
        key: this.apiKey,
        sign: sign,
      };

      console.log("[VIP] Check balance request:", {
        url: `${this.baseUrl}/profile`,
        hasApiKey: !!this.apiKey,
        hasSign: !!sign,
      });

      const response = await fetch(`${this.baseUrl}/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(requestBody).toString(),
      });

      if (!response.ok) {
        throw new ProviderError(
          `VIP Reseller API error: ${response.statusText}`,
          "VIP_RESELLER"
        );
      }

      const data = await response.json();

      if (data.result === false) {
        throw new ProviderError(
          data.message || "Failed to check balance",
          "VIP_RESELLER"
        );
      }

      return {
        provider: ProviderType.VIP_RESELLER,
        balance: parseFloat(data.data?.balance || "0"),
        currency: "IDR",
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new ProviderError(
        `Failed to check VIP balance: ${error instanceof Error ? error.message : "Unknown error"}`,
        "VIP_RESELLER"
      );
    }
  }

  async getProducts(): Promise<ProviderProduct[]> {
    try {
      const sign = this.sign || this.generateSignature();
      
      const response = await fetch(`${this.baseUrl}/prepaid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          key: this.apiKey,
          sign: sign,
          type: "services",
        }).toString(),
      });

      if (!response.ok) {
        throw new ProviderError(
          `VIP Reseller API error: ${response.statusText}`,
          "VIP_RESELLER"
        );
      }

      const data = await response.json();

      if (data.result === false) {
        throw new ProviderError(
          data.message || "Failed to get products",
          "VIP_RESELLER"
        );
      }

      if (!data.data || !Array.isArray(data.data)) {
        return [];
      }

      return data.data.map((item: any) => ({
        providerCode: item.code,
        providerName: item.name,
        category: item.category,
        brand: item.brand,
        type: item.type || "prepaid",
        price: parseFloat(item.price?.basic || item.price || "0"),
        stock: item.status === "available" || item.seller_product_status === "available",
        description: item.description,
      }));
    } catch (error) {
      throw new ProviderError(
        `Failed to get VIP products: ${error instanceof Error ? error.message : "Unknown error"}`,
        "VIP_RESELLER"
      );
    }
  }

  async purchase(request: ProviderPurchaseRequest): Promise<ProviderPurchaseResponse> {
    try {
      const refId = `VIP-${Date.now()}`;
      const sign = this.sign || this.generateSignature();
      
      const response = await fetch(`${this.baseUrl}/prepaid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          key: this.apiKey,
          sign: sign,
          type: "order",
          service: request.productCode,
          data_no: request.target,
          ref_id: refId,
        }).toString(),
      });

      if (!response.ok) {
        throw new ProviderError(
          `VIP Reseller API error: ${response.statusText}`,
          "VIP_RESELLER"
        );
      }

      const data = await response.json();

      return {
        success: data.result === true && data.data?.status === "success",
        transactionId: data.data?.trx_id || refId,
        serialNumber: data.data?.sn,
        message: data.data?.message || data.message || "Transaction processed",
        rawResponse: data,
      };
    } catch (error) {
      throw new ProviderError(
        `Failed to purchase from VIP: ${error instanceof Error ? error.message : "Unknown error"}`,
        "VIP_RESELLER"
      );
    }
  }

  async healthCheck(): Promise<ProviderHealthCheck> {
    const startTime = Date.now();
    
    try {
      await this.checkBalance();
      const latency = Date.now() - startTime;

      return {
        provider: ProviderType.VIP_RESELLER,
        status: ProviderStatus.ONLINE,
        latency,
        lastCheck: new Date(),
        message: "Provider is healthy",
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        provider: ProviderType.VIP_RESELLER,
        status: ProviderStatus.OFFLINE,
        latency,
        lastCheck: new Date(),
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private generateSignature(additionalData?: string): string {
    // If static sign is provided in env, use it (VIP often uses static sign)
    if (this.sign) {
      console.log("[VIP] Using static sign from env");
      return this.sign;
    }

    // VIP Reseller signature: MD5(API_ID + API_KEY) or MD5(API_ID + API_KEY + additionalData)
    console.log("[VIP] Generating dynamic signature");
    const crypto = require("crypto");
    const md5 = crypto.createHash("md5");
    const signString = additionalData 
      ? this.apiId + this.apiKey + additionalData 
      : this.apiId + this.apiKey;
    md5.update(signString);
    const signature = md5.digest("hex");
    console.log("[VIP] Generated signature (first 10 chars):", signature.substring(0, 10));
    return signature;
  }
}
