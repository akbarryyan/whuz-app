import { IProviderPort } from "@/src/core/ports/provider.port";
import { ProviderType, ProviderMode } from "@/src/core/domain/enums/provider.enum";
import { DigiflazzAdapter } from "./digiflazz/digiflazz.adapter";
import { VipResellerAdapter } from "./vip/vip.adapter";
import { MockProviderAdapter } from "./mock/mock-provider.adapter";

export class ProviderFactory {
  /**
   * Create provider instance based on type and environment mode
   */
  static create(providerType: ProviderType): IProviderPort {
    const mode = this.getProviderMode(providerType);

    if (mode === ProviderMode.MOCK) {
      return new MockProviderAdapter(providerType);
    }

    switch (providerType) {
      case ProviderType.DIGIFLAZZ:
        return new DigiflazzAdapter();
      case ProviderType.VIP_RESELLER:
        return new VipResellerAdapter();
      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  /**
   * Get all available providers
   */
  static getAllProviders(): IProviderPort[] {
    return [
      this.create(ProviderType.DIGIFLAZZ),
      this.create(ProviderType.VIP_RESELLER),
    ];
  }

  /**
   * Get provider mode from environment
   */
  private static getProviderMode(providerType: ProviderType): ProviderMode {
    const envKey =
      providerType === ProviderType.DIGIFLAZZ
        ? "PROVIDER_DIGIFLAZZ_MODE"
        : "PROVIDER_VIP_MODE";

    const mode = process.env[envKey];

    if (mode === ProviderMode.REAL) {
      return ProviderMode.REAL;
    }

    // Default to mock for safety
    return ProviderMode.MOCK;
  }

  /**
   * Get provider mode info for all providers
   */
  static getProviderModes(): Record<string, ProviderMode> {
    return {
      [ProviderType.DIGIFLAZZ]: this.getProviderMode(ProviderType.DIGIFLAZZ),
      [ProviderType.VIP_RESELLER]: this.getProviderMode(ProviderType.VIP_RESELLER),
    };
  }
}
