import { IProviderPort } from "@/src/core/ports/provider.port";
import { ProviderType, ProviderMode } from "@/src/core/domain/enums/provider.enum";
import { DigiflazzAdapter } from "./digiflazz/digiflazz.adapter";
import { VipResellerAdapter } from "./vip/vip.adapter";
import { MockProviderAdapter } from "./mock/mock-provider.adapter";

// ── Runtime mode override (admin toggle, survives hot-reload via globalThis) ──
const g = globalThis as unknown as {
  _providerModeOverride?: Partial<Record<ProviderType, ProviderMode>>;
};
if (!g._providerModeOverride) g._providerModeOverride = {};

export function setProviderModeOverride(provider: ProviderType, mode: ProviderMode | null): void {
  if (!g._providerModeOverride) g._providerModeOverride = {};
  if (mode === null) {
    delete g._providerModeOverride[provider];
  } else {
    g._providerModeOverride[provider] = mode;
  }
}

export function getProviderModeOverrides(): Partial<Record<ProviderType, ProviderMode>> {
  return { ...(g._providerModeOverride ?? {}) };
}

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
   * Get provider mode — runtime override takes precedence over env vars
   */
  static getProviderMode(providerType: ProviderType): ProviderMode {
    // 1. Admin runtime override
    const override = g._providerModeOverride?.[providerType];
    if (override) return override;

    // 2. Environment variable
    const envKey =
      providerType === ProviderType.DIGIFLAZZ
        ? "PROVIDER_DIGIFLAZZ_MODE"
        : "PROVIDER_VIP_MODE";
    const envMode = process.env[envKey];
    if (envMode === ProviderMode.REAL) return ProviderMode.REAL;

    // 3. Default: mock (safe default)
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
