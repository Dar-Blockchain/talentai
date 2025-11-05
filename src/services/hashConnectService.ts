// Dynamic imports for client-side only
let HashConnect: any;
let AccountId: any;
let LedgerId: any;
let TransferTransaction: any;
let Hbar: any;
let AccountBalanceQuery: any;
let Client: any;

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

class HashConnectService {
  private hashConnect: any = null;
  private events: Partial<HashConnectEvents> = {};
  private isInitialized = false;
  private connectedAccountIds: any[] = [];

  // Configuration
  private readonly env = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
  private readonly targetAccountId = process.env.NEXT_PUBLIC_TARGET_ACCOUNT_ID || '0.0.1378';
  private readonly projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'bfa190dbe93fcf30377b932b31129d05';

  private readonly appMetadata = {
    name: "TalentAI",
    description: "Token purchase system for TalentAI platform",
    icons: [typeof window !== 'undefined' ? window.location.origin + "/favicon.ico" : "https://app.talentai.bid/favicon.ico"],
    url: typeof window !== 'undefined' ? window.location.origin : "https://app.talentai.bid",
  };

  // Initialization promise
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.loadModules().then(() => {
        this.init();
      }).catch((error) => {
        console.error('Failed to load HashConnect modules:', error);
        this.events.onError?.('Failed to load HashConnect modules');
      });
    }
  }

  /**
   * Load HashConnect modules dynamically (client-side only)
   */
  private async loadModules(): Promise<void> {
    try {
      const [hashConnectModule, hederaModule] = await Promise.all([
        import('hashconnect'),
        import('@hashgraph/sdk')
      ]);

      HashConnect = hashConnectModule.HashConnect;
      AccountId = hederaModule.AccountId;
      LedgerId = hederaModule.LedgerId;
      TransferTransaction = hederaModule.TransferTransaction;
      Hbar = hederaModule.Hbar;
      AccountBalanceQuery = hederaModule.AccountBalanceQuery;
      Client = hederaModule.Client;

      console.log('HashConnect modules loaded successfully');
    } catch (error) {
      console.error('Failed to load HashConnect modules:', error);
      throw error;
    }
  }

  /**
   * Initialize HashConnect instance
   */
  private async init(): Promise<void> {
    try {
      if (!HashConnect) {
        console.warn('HashConnect modules not loaded yet');
        return;
      }

      console.log('Initializing modern HashConnect...');
      console.log('Network:', this.env);
      console.log('Project ID:', this.projectId);

      // Validate network configuration
      if (this.env !== 'testnet' && this.env !== 'mainnet') {
        throw new Error(`Invalid Hedera network: ${this.env}. Must be 'testnet' or 'mainnet'`);
      }

      // Create HashConnect instance with explicit testnet configuration
      this.hashConnect = new HashConnect(
        LedgerId.fromString(this.env), // Explicitly set to testnet
        this.projectId,
        {
          ...this.appMetadata,
          // Add explicit network information
          network: this.env,
        },
        true // debug mode
      );

      // Set up event handlers before initializing
      this.setupEventHandlers();

      // Initialize HashConnect with network validation
      console.log(`Initializing HashConnect on ${this.env} network...`);
      this.initPromise = this.hashConnect.init();
      await this.initPromise;

      // Verify the network after initialization
      const connectedNetwork = this.hashConnect.network || this.env;
      console.log('Connected to network:', connectedNetwork);

      if (connectedNetwork !== this.env) {
        console.warn(`Network mismatch: expected ${this.env}, got ${connectedNetwork}`);
      }

      console.log('HashConnect initialized successfully on', this.env, 'network');
      this.isInitialized = true;

      // Notify that initialization is complete
      this.events.onInitialized?.();

    } catch (error) {
      console.error('Failed to initialize HashConnect:', error);
      this.events.onError?.(`Failed to initialize HashConnect: ${error}`);
    }
  }

  /**
   * Set up HashConnect event handlers
   */
  private setupEventHandlers(): void {
    if (!this.hashConnect) return;

    try {
      // Connection status changes - check if event exists
      if (this.hashConnect.connectionStatusChangeEvent) {
        this.hashConnect.connectionStatusChangeEvent.on((status: any) => {
          console.log('HashConnect connection status changed:', status);

          const mappedStatus = this.mapConnectionState(status);
          this.events.onConnectionStatusChange?.(mappedStatus);

          if (status === 'Connected') {
            this.handleWalletConnected();
          } else if (status === 'Disconnected') {
            this.handleWalletDisconnected();
          }
        });
      }

      // Pairing events - check if event exists
      if (this.hashConnect.pairingEvent) {
        this.hashConnect.pairingEvent.on((pairing: any) => {
          console.log('HashConnect pairing event:', pairing);
          this.handleWalletConnected();
        });
      }

      // Found extension event - check if event exists
      if (this.hashConnect.foundExtensionEvent) {
        this.hashConnect.foundExtensionEvent.on((walletMetadata: any) => {
          console.log('HashPack extension found:', walletMetadata);
        });
      }

      // Alternative event listeners for modern HashConnect
      if (this.hashConnect.on) {
        this.hashConnect.on('accountsChanged', (accounts:any) => {
          console.log('Accounts changed:', accounts);
          if (accounts && accounts.length > 0) {
            this.handleWalletConnected();
          } else {
            this.handleWalletDisconnected();
          }
        });

        this.hashConnect.on('chainChanged', (chainId:any) => {
          console.log('Chain changed:', chainId);
        });
      }

    } catch (error) {
      console.warn('Some HashConnect events may not be available:', error);
    }
  }

  /**
   * Map HashConnect connection state to our simplified status
   */
  private mapConnectionState(state: string): ConnectionStatus {
    switch (state) {
      case 'Connected':
        return 'connected';
      case 'Connecting':
        return 'connecting';
      case 'Disconnected':
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }

  /**
   * Handle wallet connected event
   */
  private async handleWalletConnected(): Promise<void> {
    try {
      // Wait a bit for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      const accountIds = this.getConnectedAccountIds();
      console.log('Connected account IDs:', accountIds);

      if (!accountIds || accountIds.length === 0) {
        console.warn('No connected accounts found, retrying...');
        // Retry multiple times with increasing delays
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1)));
          const retryAccountIds = this.getConnectedAccountIds();

          if (retryAccountIds && retryAccountIds.length > 0) {
            console.log('Accounts found after retry:', retryAccountIds);
            break;
          }
        }

        const finalCheck = this.getConnectedAccountIds();
        if (!finalCheck || finalCheck.length === 0) {
          console.error('No connected accounts found after multiple retries');
          this.events.onConnectionStatusChange?.('error');
          this.events.onError?.('Failed to detect connected accounts. Please try reconnecting your wallet.');
          return;
        }
      }

      const finalAccountIds = this.getConnectedAccountIds();
      if (finalAccountIds && finalAccountIds.length > 0) {
        const accountId = finalAccountIds[0].toString();
        const balance = await this.getAccountBalance(accountId);

        const walletInfo: WalletInfo = {
          accountId,
          balance,
          network: this.env
        };

        console.log('Wallet connected successfully:', walletInfo);
        this.events.onConnectionStatusChange?.('connected');
        this.events.onWalletConnected?.(walletInfo);
      } else {
        // Absolutely no accounts found - this is an error state
        console.error('Wallet connection event fired but no accounts available');
        this.events.onConnectionStatusChange?.('error');
        this.events.onError?.('Wallet connected but no accounts found. Please ensure your wallet is properly set up.');
      }
    } catch (error) {
      console.error('Failed to get wallet info:', error);
      this.events.onConnectionStatusChange?.('error');
      this.events.onError?.(`Failed to get wallet info: ${error}`);
    }
  }

  /**
   * Handle wallet disconnected event
   */
  private handleWalletDisconnected(): void {
    this.connectedAccountIds = [];
    this.events.onWalletDisconnected?.();
  }

  /**
   * Get connected account IDs with validation
   */
  public getConnectedAccountIds(): any[] | null {
    if (!this.hashConnect) {
      console.log('HashConnect not initialized');
      return null;
    }

    try {
      const accounts = this.hashConnect.connectedAccountIds;
      console.log('Raw connected accounts:', accounts);

      // Validate account format
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        // Filter out invalid or undefined accounts
        const validAccounts = accounts.filter(account => {
          if (!account) return false;

          // Check if account has toString method or is already a string
          const accountStr = account.toString ? account.toString() : String(account);

          // Validate Hedera account ID format (e.g., 0.0.1234)
          const hederaAccountRegex = /^\d+\.\d+\.\d+$/;
          const isValid = hederaAccountRegex.test(accountStr);

          if (!isValid) {
            console.warn('Invalid account format:', accountStr);
          }

          return isValid;
        });

        console.log('Valid connected accounts:', validAccounts);
        return validAccounts.length > 0 ? validAccounts : null;
      }

      console.log('No valid connected accounts found');
      return null;
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return null;
    }
  }

  /**
   * Get account balance from Hedera network
   */
  private async getAccountBalance(accountId: string): Promise<number> {
    try {
      if (!AccountBalanceQuery || !AccountId || !Client) {
        console.warn('Hedera SDK modules not loaded yet');
        return 0;
      }

      console.log(`Fetching balance for account: ${accountId}`);

      // Create a client for querying (read-only, no operator needed for balance queries)
      const client = this.env === 'mainnet' ? Client.forMainnet() : Client.forTestnet();

      // Parse account ID
      const hederaAccountId = AccountId.fromString(accountId);

      // Query the account balance
      const query = new AccountBalanceQuery()
        .setAccountId(hederaAccountId);

      const accountBalance = await query.execute(client);

      // Close the client
      client.close();

      // Convert from tinybars to HBAR
      const hbarBalance = accountBalance.hbars.toTinybars().toNumber() / 100000000;

      console.log(`Account ${accountId} balance: ${hbarBalance} HBAR`);

      return hbarBalance;
    } catch (error) {
      console.error('Failed to get account balance:', error);
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
   * Connect to HashPack wallet
   */
  public async connectWallet(): Promise<void> {
    try {
      console.log('=== Starting wallet connection process ===');

      if (!this.isInitialized || !this.hashConnect) {
        console.log('HashConnect not initialized, waiting...');
        this.events.onConnectionStatusChange?.('connecting');

        // Wait for initialization with timeout
        if (this.initPromise) {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('HashConnect initialization timeout')), 10000)
          );

          await Promise.race([this.initPromise, timeoutPromise]);
        }

        if (!this.hashConnect) {
          throw new Error('HashConnect failed to initialize');
        }
      }

      console.log('HashConnect initialized, checking existing connections...');

      // Check if already connected
      const existingAccounts = this.getConnectedAccountIds();
      if (existingAccounts && existingAccounts.length > 0) {
        console.log('Already connected to accounts:', existingAccounts);
        await this.handleWalletConnected();
        return;
      }

      console.log('No existing connections, opening pairing modal...');
      this.events.onConnectionStatusChange?.('connecting');

      // Verify HashConnect has required methods
      if (!this.hashConnect.openPairingModal) {
        throw new Error('HashConnect openPairingModal method not available');
      }

      // Validate project ID before opening modal
      if (!this.projectId || this.projectId === 'undefined') {
        throw new Error('Invalid WalletConnect Project ID. Please check your environment configuration.');
      }

      console.log('Opening pairing modal with project ID:', this.projectId);

      // Open the pairing modal with timeout and error handling
      const modalPromise = this.hashConnect.openPairingModal();
      const modalTimeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Modal opening timeout')), 15000)
      );

      await Promise.race([modalPromise, modalTimeoutPromise]);

      console.log('Pairing modal opened successfully');

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      this.events.onConnectionStatusChange?.('error');

      let errorMessage = 'Failed to connect wallet';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Connection timeout. Please ensure HashPack is installed and try again.';
        } else if (error.message.includes('Project ID')) {
          errorMessage = 'Configuration error. Invalid WalletConnect Project ID.';
        } else if (error.message.includes('openPairingModal')) {
          errorMessage = 'Wallet connection method not available. Please update HashConnect.';
        } else {
          errorMessage = `Connection failed: ${error.message}`;
        }
      }

      this.events.onError?.(errorMessage);
    }
  }

  /**
   * Disconnect from HashPack wallet
   */
  public async disconnectWallet(): Promise<void> {
    try {
      if (!this.hashConnect) {
        console.log('No wallet connected to disconnect');
        return;
      }

      console.log('Disconnecting wallet...');
      await this.hashConnect.disconnect();

      this.connectedAccountIds = [];
      this.events.onWalletDisconnected?.();

    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      this.events.onError?.(`Failed to disconnect wallet: ${error}`);
    }
  }

  /**
   * Send HBAR transaction using modern HashConnect API
   */
   public delay(time:any) {
      return new Promise(resolve => setTimeout(resolve, time));
    }
  public async sendHbarTransaction(amount: number): Promise<TransactionResult> {
    try {
      if (!this.hashConnect) {
        throw new Error('HashConnect not initialized');
      }

      await this.initPromise;

      const accountIds = this.getConnectedAccountIds();
      if (!accountIds || accountIds.length === 0) {
        throw new Error('No connected accounts');
      }
      await this.delay(100)
      console.log(accountIds[0])
      
      const senderAccountId = AccountId.fromString(accountIds[0].toString());
      const targetAccountId = AccountId.fromString(this.targetAccountId);

      console.log(`Sending ${amount} HBAR from ${senderAccountId} to ${targetAccountId}`);
      console.log(accountIds[0].toString())
      // Create transfer transaction
      const transaction = new TransferTransaction()
        .addHbarTransfer(senderAccountId, new Hbar(-amount))
        .addHbarTransfer(targetAccountId, new Hbar(amount))
        .setTransactionMemo('TalentAI Token Purchase');

      // Execute transaction through HashConnect
      const result = await this.hashConnect.sendTransaction(senderAccountId, transaction);

      console.log('Transaction sent successfully:', result);
      
      return {
        transactionId: result.transactionId?.toString() || `${senderAccountId}@${Date.now()}`,
        status: 'success'
      };

    } catch (error) {
      console.error('Failed to send transaction:', error);
      return {
        transactionId: '',
        status: 'error',
        message: `Transaction failed: ${error}`
      };
    }
  }

  /**
   * Get current connection status
   */
  public getConnectionStatus(): ConnectionStatus {
    if (!this.isInitialized) return 'disconnected';

    const accountIds = this.getConnectedAccountIds();
    if (accountIds && accountIds.length > 0) return 'connected';

    return 'disconnected';
  }

  /**
   * Get current wallet info if connected (async to fetch balance)
   */
  public async getWalletInfo(): Promise<WalletInfo | null> {
    const accountIds = this.getConnectedAccountIds();
    if (!accountIds || accountIds.length === 0) {
      return null;
    }

    const accountId = accountIds[0].toString();
    const balance = await this.getAccountBalance(accountId);

    return {
      accountId,
      balance,
      network: this.env
    };
  }

  /**
   * Check if HashConnect is ready for use
   */
  public isReady(): boolean {
    return this.isInitialized && !!this.hashConnect;
  }

  /**
   * Check if HashPack extension is available
   */
  public isHashPackAvailable(): boolean {
    return typeof window !== 'undefined' && !!(window as any).hashpack;
  }

  /**
   * Get target account ID for transactions
   */
  public getTargetAccountId(): string {
    return this.targetAccountId;
  }
}

// Export singleton instance
export const hashConnectService = new HashConnectService();
export default hashConnectService;