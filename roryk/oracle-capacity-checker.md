# Oracle Cloud ARM Capacity Checker

## 🔍 Quick Solutions for "Out of Capacity" Error

### Immediate Actions (Try These First)

#### 1. Try Different Availability Domains
- **AD-1**: First try
- **AD-2**: If AD-1 fails
- **AD-3**: If AD-2 fails

#### 2. Try Different Regions (Best Success Rates)
| Region | Location | Success Rate | Notes |
|--------|----------|--------------|-------|
| **us-ashburn-1** | US East (Virginia) | ⭐⭐⭐⭐⭐ | Best availability |
| **us-phoenix-1** | US West (Arizona) | ⭐⭐⭐⭐⭐ | Excellent |
| **uk-london-1** | UK South (London) | ⭐⭐⭐⭐ | Good for Europe |
| **eu-frankfurt-1** | Germany Central | ⭐⭐⭐⭐ | Good for Europe |
| **ap-tokyo-1** | Japan East | ⭐⭐⭐ | Good for Asia |
| **ap-sydney-1** | Australia East | ⭐⭐⭐ | Good for Oceania |

#### 3. Best Times to Try
- **Late night/Early morning** in your region
- **Weekends** (less business usage)
- **Off-peak hours** (avoid 9 AM - 5 PM)

### Alternative Always Free Shapes

If ARM (VM.Standard.A1.Flex) is not available:

#### AMD Shape (More Available)
```
Shape: VM.Standard.E2.1.Micro
CPU: 1 OCPU
RAM: 1GB
Storage: 47GB
Availability: ⭐⭐⭐⭐⭐ (Almost always available)
Performance: Good for RoryK (just slower)
```

### Step-by-Step Capacity Workaround

#### Method 1: Region Hopping
1. **Change Region**: Click region dropdown (top-right)
2. **Select New Region**: Try us-ashburn-1 first
3. **Create VCN**: Set up networking in new region
4. **Try Instance**: Create ARM instance
5. **Repeat**: If fails, try next region

#### Method 2: Availability Domain Cycling
1. **Try AD-1**: Create instance in first AD
2. **If Fails**: Immediately try AD-2
3. **If Fails**: Try AD-3
4. **Repeat**: Keep cycling through ADs

#### Method 3: Automated Retry
```bash
# Keep refreshing the create instance page
# ARM capacity changes frequently (every few minutes)
# Many users succeed after 10-30 attempts
```

### Success Stories & Tips

#### Community Tips
- **"Try at 3 AM"** - Many users succeed during off-hours
- **"Keep refreshing"** - Capacity changes every few minutes
- **"Use different browser"** - Sometimes helps with session issues
- **"Try mobile app"** - Oracle Cloud mobile app sometimes works better

#### Persistence Pays Off
- Most users get ARM instance within 24-48 hours
- Keep trying different regions and times
- AMD shape is always available as backup

### If All Else Fails

#### Use AMD Shape Temporarily
1. Create VM.Standard.E2.1.Micro instance
2. Deploy RoryK (works fine with 1GB RAM)
3. Keep trying for ARM shape in background
4. Migrate to ARM when available

#### Alternative Free Providers
- **Google Cloud**: e2-micro (1 vCPU, 1GB RAM)
- **AWS**: t2.micro (1 vCPU, 1GB RAM) - 12 months only
- **Render.com**: 750 hours/month free

### ARM Instance Availability Tracker

#### Real-Time Status (Community Reported)
```
Last Updated: Check Oracle Cloud Status Page
us-ashburn-1: Usually Available ✅
us-phoenix-1: Usually Available ✅
uk-london-1: Moderate Availability ⚠️
eu-frankfurt-1: Moderate Availability ⚠️
Other regions: Check individually
```

### Quick Commands for Region Switching

#### Via Oracle Cloud CLI (Advanced)
```bash
# List available regions
oci iam region list

# Check capacity in specific region
oci compute shape list --compartment-id <compartment-id> --region us-ashburn-1
```

### Success Checklist

- [ ] Tried all 3 Availability Domains in current region
- [ ] Tried at least 3 different regions
- [ ] Attempted during off-peak hours
- [ ] Considered AMD shape as alternative
- [ ] Checked Oracle Cloud status page
- [ ] Tried different browser/cleared cache

### Remember

**ARM instances are in HIGH demand** because they offer exceptional value (4 CPU, 24GB RAM for free). The capacity issue is temporary - Oracle is constantly adding more ARM capacity.

**Don't give up!** Most users succeed within 1-2 days of trying different regions and times.