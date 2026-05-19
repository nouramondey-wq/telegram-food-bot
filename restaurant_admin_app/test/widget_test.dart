import 'package:flutter_test/flutter_test.dart';

import 'package:restaurant_admin_app/main.dart';

void main() {
  testWidgets('App launches and shows login screen', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const RestaurantAdminApp());

    // Verify that the login screen is shown with the app title
    expect(find.text('مطعم الذواقة'), findsOneWidget);
    expect(find.text('تسجيل الدخول'), findsOneWidget);
  });
}
