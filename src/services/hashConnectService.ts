// Simplified Hedera Wallet Connect Service
import DAppConnector from '@hashgraph/hedera-wallet-connect/dist/lib/dapp';
import { HederaJsonRpcMethod, HederaChainId, HederaSessionEvent } from '@hashgraph/hedera-wallet-connect/dist/lib/shared';
import {
  LedgerId,
  AccountId,
  TransferTransaction,
  Hbar,
  AccountBalanceQuery,
  Client
} from '@hashgraph/sdk';

// Types
export interface WalletInfo {
  accountId: string;
  balance: number;
  network: string;
}

export interface TransactionResult {
  transactionId: string;
  status: 'success' | 'error';
  message?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface HashConnectEvents {
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onWalletConnected: (walletInfo: WalletInfo) => void;
  onWalletDisconnected: () => void;
  onError: (error: string) => void;
  onInitialized?: () => void;
}

class HederaWalletService {
  private dAppConnector: DAppConnector | null = null;
  private events: Partial<HashConnectEvents> = {};

  // Configuration
  private readonly env = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
  private readonly targetAccountId = process.env.NEXT_PUBLIC_TARGET_ACCOUNT_ID || '0.0.1378';
  private readonly projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0c0f2bb8829b2f931ebbf606c5d323eb';

  private readonly appMetadata = {
    name: "TalentAI",
    description: "Token purchase system for TalentAI platform",
    url: typeof window !== 'undefined' ? window.location.origin : "https://app.talentai.bid",
    icons: [typeof window !== 'undefined' ? window.location.origin + "/favicon.ico" : "https://app.talentai.bid/favicon.ico"],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  /**
   * Initialize DAppConnector
   */
  private async init(): Promise<void> {
    try {
      const ledgerId = this.env === 'mainnet' ? LedgerId.MAINNET : LedgerId.TESTNET;
      const chainId = this.env === 'mainnet' ? HederaChainId.Mainnet : HederaChainId.Testnet;

      this.dAppConnector = new DAppConnector(
        this.appMetadata,
        ledgerId,
        this.projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [chainId]
      );

      // Session callback
      this.dAppConnector.onSessionIframeCreated = (session) => {
        this.handleWalletConnected();
      };

      await this.dAppConnector.init({ logger: 'error' });

      this.events.onInitialized?.();
    } catch (error) {
      console.error('Init failed:', error);
      this.events.onError?.(`Initialization failed: ${error}`);
    }
  }

  /**
   * Handle wallet connected
   */
  private async handleWalletConnected(): Promise<void> {
    const accountId = this.getConnectedAccountId();
    if (!accountId) return;

    const balance = await this.getAccountBalance(accountId);

    this.events.onConnectionStatusChange?.('connected');
    this.events.onWalletConnected?.({
      accountId,
      balance,
      network: this.env
    });
  }

  /**
   * Get connected account ID
   */
  public getConnectedAccountId(): string | null {
    if (!this.dAppConnector) return null;

    try {
      const signers = this.dAppConnector.signers;
      if (signers && signers.length > 0) {
        return signers[0].getAccountId().toString();
      }
    } catch (error) {
      console.error('Error getting account:', error);
    }
    return null;
  }

  /**
   * Get account balance
   */
  private async getAccountBalance(accountId: string): Promise<number> {
    try {
      const client = this.env === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      const hederaAccountId = AccountId.fromString(accountId);
      const query = new AccountBalanceQuery().setAccountId(hederaAccountId);
      const accountBalance = await query.execute(client);
      client.close();

      return accountBalance.hbars.toTinybars().toNumber() / 100000000;
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Register event handlers
   */
  public setEventHandlers(events: Partial<HashConnectEvents>): void {
    this.events = { ...this.events, ...events };
  }

  /**
   * Connect wallet
   */
  public async connectWallet(): Promise<void> {
    if (!this.dAppConnector) {
      throw new Error('Not initialized');
    }

    // Check if already connected
    const existingAccount = this.getConnectedAccountId();
    if (existingAccount) {
      await this.handleWalletConnected();
      return;
    }

    this.events.onConnectionStatusChange?.('connecting');

    // Open modal
    await this.dAppConnector.openModal();
    await this.handleWalletConnected();
  }

  /**
   * Disconnect wallet
   */
  public async disconnectWallet(): Promise<void> {
    if (!this.dAppConnector) return;

    await this.dAppConnector.disconnectAll();
    this.events.onConnectionStatusChange?.('disconnected');
    this.events.onWalletDisconnected?.();
  }

  /**
   * Send HBAR transaction
   */
  public async sendHbarTransaction(amount: number): Promise<TransactionResult> {
    try {
      if (!this.dAppConnector) {
        throw new Error('Not initialized');
      }

      const accountId = this.getConnectedAccountId();
      if (!accountId) {
        throw new Error('No connected account');
      }

      const senderAccountId = AccountId.fromString(accountId);
      const targetAccountId = AccountId.fromString(this.targetAccountId);
      const client = this.env === 'mainnet' ? Client.forMainnet() : Client.forTestnet();

      const transaction = new TransferTransaction()
        .addHbarTransfer(senderAccountId, new Hbar(-amount))
        .addHbarTransfer(targetAccountId, new Hbar(amount))
        .setTransactionMemo('TalentAI Token Purchase')
        .freezeWith(client);

      const signer = this.dAppConnector.signers[0];
      const signedTransaction = await signer.signTransaction(transaction);
      const txResponse = await signedTransaction.execute(client);
      const receipt = await txResponse.getReceipt(client);

      client.close();

      return {
        transactionId: txResponse.transactionId.toString(),
        status: 'success'
      };
    } catch (error) {
      return {
        transactionId: '',
        status: 'error',
        message: `Transaction failed: ${error}`
      };
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    const accountId = this.getConnectedAccountId();
    return accountId ? 'connected' : 'disconnected';
  }

  /**
   * Get wallet info
   */
  public async getWalletInfo(): Promise<WalletInfo | null> {
    const accountId = this.getConnectedAccountId();
    if (!accountId) return null;

    const balance = await this.getAccountBalance(accountId);
    return {
      accountId,
      balance,
      network: this.env
    };
  }

  /**
   * Check if ready
   */
  public isReady(): boolean {
    return !!this.dAppConnector;
  }

  /**
   * Get target account ID
   */
  public getTargetAccountId(): string {
    return this.targetAccountId;
  }
}

// Export singleton
export const hashConnectService = new HederaWalletService();
export default hashConnectService;
