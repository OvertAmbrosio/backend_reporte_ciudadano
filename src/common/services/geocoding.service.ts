import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeocodingService {
  async getAddress(lat: number, lon: number) {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
        { headers: { 'User-Agent': 'CitizenReportApp/1.0' } }
      );

      const address = response.data.address;
      return {
        country: address.country || null,
        department: address.state || address.region || null,
        district: address.city || address.suburb || address.village || address.county || null,
        full_address: response.data.display_name,
      };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { country: null, department: null, district: null, full_address: null };
    }
  }
}
