
## Fix Coin Rotation to Better Display Logo

### Current Problem
The coin is:
1. **Initially tilted** at `rotation={[0.15, 0, 0.1]}` on the group - this angles it away from the camera
2. **Rotating on Y-axis** with `meshRef.current.rotation.y += delta * 0.6` - which causes the logo to face away from the viewer periodically

This combination makes the embossed logo difficult to see during the rotation cycle.

### Solution: Reorient the Coin's Rotation Axis

**Approach:** Change the coin to rotate on the **X-axis** instead of the Y-axis. This will make the coin "flip" end-over-end, which:
- Keeps the logo facing more directly toward the camera throughout the spin
- Creates a more dynamic, tumbling effect
- Better showcases the embossed logo on both sides

**Implementation Details:**

1. **Modify the rotation animation** (line 51):
   - Change from: `meshRef.current.rotation.y += delta * 0.6;`
   - Change to: `meshRef.current.rotation.x += delta * 0.6;`
   
2. **Adjust initial tilt** (line 64):
   - Current: `rotation={[0.15, 0, 0.1]}`
   - New: `rotation={[0, 0.3, 0]}`
   - This tilts the coin slightly around the Z-axis so you can see the ridged edges, without interfering with the X-axis rotation

**Result:** The coin will tumble forward and backward, with the logo facing the camera twice per rotation, making it much more visible.

### Alternative (if preferred):
If you want the coin to spin like a frisbee (Z-axis rotation) instead:
- Change to: `meshRef.current.rotation.z += delta * 0.6;`
- Keep initial tilt as: `rotation={[0.2, 0, 0]}`
- This would show the coin spinning "like a record player"

### Files to Update
- `src/components/GoldenCoin.tsx` - Change rotation axis and initial tilt

