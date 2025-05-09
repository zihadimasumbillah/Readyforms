import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  details: {
    auth: boolean;
    templates: boolean;
    responses: boolean;
    users: boolean;
    tags: boolean;
  };
  message: string;
  timestamp: string;
}

export const checkApiHealth = async (): Promise<HealthCheckResult> => {
  try {
    console.log('Starting API health check...');
    const healthResult: HealthCheckResult = {
      status: 'healthy',
      details: {
        auth: false,
        templates: false,
        responses: false,
        users: false,
        tags: false
      },
      message: '',
      timestamp: new Date().toISOString()
    };

    try {
      const baseResponse = await axios.get(`${API_URL}/health`);
      console.log('Base health check response:', baseResponse.status);
    } catch (error) {
      console.error('API base health check failed:', error);
      healthResult.status = 'unhealthy';
      healthResult.message = 'API server unreachable';
      return healthResult;
    }

    try {
   
      await axios.post(`${API_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      healthResult.details.auth = true;
      console.log('Auth endpoint check: OK');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
        healthResult.details.auth = true;
        console.log('Auth endpoint check: OK (expected auth failure)');
      } else {
        console.error('Auth endpoint check failed:', error);
      }
    }
    try {
      await axios.get(`${API_URL}/templates`);
      healthResult.details.templates = true;
      console.log('Templates endpoint check: OK');
    } catch (error) {
      console.error('Templates endpoint check failed:', error);
    }
    try {
      await axios.get(`${API_URL}/tags`);
      healthResult.details.tags = true;
      console.log('Tags endpoint check: OK');
    } catch (error) {
      console.error('Tags endpoint check failed:', error);
    }
    try {
      await axios.get(`${API_URL}/users`);
      healthResult.details.users = true;
      console.log('Users endpoint check: OK');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        healthResult.details.users = true;
        console.log('Users endpoint check: OK (expected auth required)');
      } else {
        console.error('Users endpoint check failed:', error);
      }
    }
    try {
      await axios.get(`${API_URL}/form-responses/user`);
      healthResult.details.responses = true;
      console.log('Responses endpoint check: OK');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        healthResult.details.responses = true;
        console.log('Responses endpoint check: OK (expected auth required)');
      } else {
        console.error('Responses endpoint check failed:', error);
      }
    }

    const failedServices = Object.entries(healthResult.details)
      .filter(([_, isHealthy]) => !isHealthy)
      .map(([service]) => service);

    if (failedServices.length > 0) {
      healthResult.status = 'unhealthy';
      healthResult.message = `These services are unhealthy: ${failedServices.join(', ')}`;
    } else {
      healthResult.message = 'All services are healthy';
    }

    console.log('API health check completed:', healthResult);
    return healthResult;
  } catch (error) {
    console.error('API health check failed with unexpected error:', error);
    return {
      status: 'unhealthy',
      details: {
        auth: false,
        templates: false,
        responses: false,
        users: false,
        tags: false
      },
      message: 'API health check failed with an unexpected error',
      timestamp: new Date().toISOString()
    };
  }
};

export const isApiReachable = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/health`);
    return true;
  } catch (error) {
    console.error('API reachability check failed:', error);
    return false;
  }
};

export default {
  checkApiHealth,
  isApiReachable
};