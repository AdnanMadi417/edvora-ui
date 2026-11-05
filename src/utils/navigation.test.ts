import type { IRoute } from "types/navigation";
import {
  isWindowAvailable,
  findCurrentRoute,
  getActiveRoute,
  getActiveNavbar,
  getActiveNavbarText,
} from './navigation'

// Mock window object
const mockWindow = (available: boolean) => {
  if (available) {
    Object.defineProperty(window, 'window', {
      value: window,
      writable: true,
    })
  } else {
    // @ts-ignore
    delete global.window
  }
}

describe('Navigation Utilities', () => {
  describe('isWindowAvailable', () => {
    it('returns true when window is available', () => {
      expect(isWindowAvailable()).toBe(true)
    })

    // Note: In jsdom environment, window is always available, so we can't test the false case
    // The function checks typeof window !== 'undefined', which is always true in test environment
  })

  describe('findCurrentRoute', () => {
    const mockRoutes = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        items: undefined,
      },
      {
        name: 'Applications',
        path: '/applications',
        items: [
          {
            name: 'All Applications',
            path: '/applications',
            items: undefined,
          },
          {
            name: 'New Application',
            path: '/applications/new',
            items: undefined,
          },
        ],
      },
    ]

    beforeEach(() => {
      // Ensure window is available
      if (typeof window === 'undefined') {
        // @ts-ignore
        global.window = {}
      }
    })

    it('finds a top-level route', () => {
      const route = findCurrentRoute(mockRoutes, '/dashboard')
      expect(route).toBeDefined()
      expect(route?.name).toBe('Dashboard')
      expect(route?.path).toBe('/dashboard')
    })

    it('finds a nested route', () => {
      const route = findCurrentRoute(mockRoutes, '/applications/new')
      expect(route).toBeDefined()
      expect(route?.name).toBe('New Application')
      expect(route?.path).toBe('/applications/new')
    })

    it('finds a more specific nested route when it comes first', () => {
      // Test with a route structure where more specific route comes first
      const routesWithSpecificFirst = [
        {
          name: 'Applications',
          path: '/applications',
          items: [
            {
              name: 'New Application',
              path: '/applications/new',
              items: undefined,
            },
            {
              name: 'All Applications',
              path: '/applications',
              items: undefined,
            },
          ],
        },
      ]
      const route = findCurrentRoute(routesWithSpecificFirst, '/applications/new')
      expect(route).toBeDefined()
      expect(route?.name).toBe('New Application')
      expect(route?.path).toBe('/applications/new')
    })

    it('finds a route with partial match', () => {
      const route = findCurrentRoute(mockRoutes, '/applications/123')
      expect(route).toBeDefined()
      expect(route?.name).toBe('All Applications')
    })

    // Note: In jsdom environment, window is always available, so we can't test the null case
    // The function returns null when window is undefined, but jsdom always provides window

    it('returns undefined when route is not found', () => {
      const route = findCurrentRoute(mockRoutes, '/nonexistent')
      expect(route).toBeUndefined()
    })

    it('handles empty routes array', () => {
      const route = findCurrentRoute([], '/dashboard')
      expect(route).toBeUndefined()
    })
  })

  describe('getActiveRoute', () => {
    const mockRoutes = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        items: undefined,
      },
    ]

    beforeEach(() => {
      if (typeof window === 'undefined') {
        // @ts-ignore
        global.window = {}
      }
    })

    it('returns route name when found', () => {
      const activeRoute = getActiveRoute(mockRoutes, '/dashboard')
      expect(activeRoute).toBe('Dashboard')
    })

    it('returns default when route is not found', () => {
      const activeRoute = getActiveRoute(mockRoutes, '/nonexistent')
      expect(activeRoute).toBe('Main Dashboard')
    })

    // Note: In jsdom environment, window is always available, so we can't test the default case
    // The function returns 'Main Dashboard' when window is undefined, but jsdom always provides window
  })

  describe('getActiveNavbar', () => {
    const mockRoutes = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        secondary: true,
        items: undefined,
      },
      {
        name: 'Settings',
        path: '/settings',
        secondary: false,
        items: undefined,
      },
    ]

    beforeEach(() => {
      if (typeof window === 'undefined') {
        // @ts-ignore
        global.window = {}
      }
    })

    it('returns true when route has secondary property set to true', () => {
      const isSecondary = getActiveNavbar(mockRoutes, '/dashboard')
      expect(isSecondary).toBe(true)
    })

    it('returns false when route has secondary property set to false', () => {
      const isSecondary = getActiveNavbar(mockRoutes, '/settings')
      expect(isSecondary).toBe(false)
    })

    it('returns undefined when route is not found', () => {
      const isSecondary = getActiveNavbar(mockRoutes, '/nonexistent')
      expect(isSecondary).toBeUndefined()
    })
  })

  describe('getActiveNavbarText', () => {
    const mockRoutes = [
      {
        name: 'Dashboard',
        path: '/dashboard',
        items: undefined,
      },
    ]

    beforeEach(() => {
      if (typeof window === 'undefined') {
        // @ts-ignore
        global.window = {}
      }
    })

    it('returns route name when found', () => {
      const text = getActiveNavbarText(mockRoutes, '/dashboard')
      expect(text).toBe('Dashboard')
    })

    it('returns default text when route is not found', () => {
      // getActiveNavbarText calls getActiveRoute, which returns 'Main Dashboard' when route not found
      // Since getActiveRoute returns 'Main Dashboard' (truthy), getActiveNavbarText returns that, not false
      const text = getActiveNavbarText(mockRoutes, '/nonexistent')
      expect(text).toBe('Main Dashboard')
    })
  })
})


const routes: IRoute[] = [{ name: "Knowledge Hub", layout: "/admin", path: "/knowledge-hub", children: [
  { name: "Programs", layout: "/admin", path: "/knowledge-hub" },
  { name: "Universities", layout: "/admin", path: "/universities" },
  { name: "Configuration", layout: "/admin/config-universities", path: "" },
  { name: "Payment methods", layout: "/admin/config-universities", path: "/payment-methods" },
] }];
it("resolves nested universities and detail pages", () => {
  expect(findCurrentRoute(routes, "/admin/universities/uni_001")?.name).toBe("Universities");
  expect(findCurrentRoute(routes, "/admin/knowledge-hub")?.name).toBe("Programs");
});
it("prefers the most specific full route and avoids partial matches", () => {
  expect(findCurrentRoute(routes, "/admin/config-universities/payment-methods/1")?.name).toBe("Payment methods");
  expect(findCurrentRoute(routes, "/admin/universities-other")).toBeUndefined();
});

it("names directly linked sections omitted from sidebar routes", () => {
  expect(getActiveRoute([], "/partner/universities/uni_001")).toBe("Universities");
});
