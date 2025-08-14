import axios from 'axios';
import { ResumeNFTMetadata } from './hedera';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface CreateNFTRequest {
  resumeData: any;
  userInfo: {
    fullName: string;
    email: string;
    phone?: string;
    profession?: string;
  };
}

export interface CreateNFTResponse {
  success: boolean;
  nftId: string;
  verificationUrl: string;
  verificationUrls: {
    custom: string;
    hedera: string;
    mirror: string;
  };
  metadata: any;
  onChainMetadata: any;
  message: string;
}

export class NFTService {
  private getAuthToken() {
    return localStorage.getItem('api_token') || localStorage.getItem('token') || null;
  }

  async createResumeNFT(data: CreateNFTRequest): Promise<CreateNFTResponse> {
    try {
      const token = this.getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/resume/create-nft`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error creating NFT:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to create NFT verification'
      );
    }
  }

  async verifyResumeNFT(nftId: string): Promise<ResumeNFTMetadata | null> {
    try {
      const token = this.getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/resume/verify-nft/${nftId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.metadata;
    } catch (error: any) {
      console.error('Error verifying NFT:', error);
      return null;
    }
  }

  async getResumeNFTs(resumeId: string): Promise<CreateNFTResponse[]> {
    try {
      const token = this.getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/resume/nfts/${resumeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.nfts || [];
    } catch (error: any) {
      console.error('Error fetching NFTs:', error);
      return [];
    }
  }
}

export const nftService = new NFTService(); 